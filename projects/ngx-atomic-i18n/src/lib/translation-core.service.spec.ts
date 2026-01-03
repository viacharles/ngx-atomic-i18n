import 'jest';
import { TranslationCoreService } from './translation-core.service';
import { TranslationConfig, Translations } from './translate.type';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ICU_FORMATTER_TOKEN, TRANSLATION_CONFIG, TRANSLATION_LOADER } from './translate.token';


describe('TranslationCoreService', () => {
  let service: TranslationCoreService;
  let consoleWarnSpy: jest.SpyInstance;
  let configMock: TranslationConfig;
  let loaderMock: any;
  let icuFormatterMock: any;

  beforeEach(() => {
    TestBed.resetTestingModule();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    configMock = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      customLang: () => 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      missingTranslationBehavior: 'show-key',
      langDetectionOrder: ['localStorage', 'url', 'browser', 'customLang', 'fallback'],
      debug: true,
    };
    loaderMock = {
      load: jest.fn().mockResolvedValue({ hello: 'world' })
    };
    icuFormatterMock = null;
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    TestBed.configureTestingModule({
      providers: [
        TranslationCoreService,
        { provide: TRANSLATION_CONFIG, useValue: configMock },
        { provide: TRANSLATION_LOADER, useValue: loaderMock },
        { provide: ICU_FORMATTER_TOKEN, useValue: icuFormatterMock },
        { provide: DOCUMENT, useValue: {} },
      ]
    });
    service = TestBed.inject(TranslationCoreService);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should instantiate with ICU formatter provided (cover 23-34)', () => {
      const ICUFake = jest.fn();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: ICU_FORMATTER_TOKEN, useValue: ICUFake },
          { provide: TRANSLATION_CONFIG, useValue: configMock },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: DOCUMENT, useValue: {} },
          TranslationCoreService,
        ]
      });
      const instance = TestBed.inject(TranslationCoreService);
      expect(instance).toBeInstanceOf(TranslationCoreService);
    });
  })

  describe('lang', () => {
    it('should return current language signal', () => {
      expect(service.lang()).toBe('en');
    });
  });

  describe('currentLang', () => {
    it('should return current language string', () => {
      expect(service.currentLang).toBe('en');
    });
  });

  describe('setLang', () => {
    it('should set language if supported', () => {
      const service = TestBed.inject(TranslationCoreService);
      service.setLang('zh-Hant');
      expect(service.currentLang).toBe('zh-Hant');
    });

    it('should not set unsupported language', () => {
      const service = TestBed.inject(TranslationCoreService);
      service.setLang('en');
      expect(service.currentLang).toBe('en');
      service.setLang('fr');
      expect(service.currentLang).toBe('en');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should warn if localStorage write fails (cover line 46)', () => {
      const orig = global.localStorage;
      Object.defineProperty(global, 'localStorage', {
        value: {
          setItem: jest.fn(() => { throw new Error('Simulated localStorage write failure'); }),
          getItem: jest.fn(),
          removeItem: jest.fn(),
        },
        configurable: true,
      });
      consoleWarnSpy.mockClear();
      service.setLang('zh-Hant');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const callArgs = consoleWarnSpy.mock.calls[0];
      expect(callArgs[0]).toBe('[ngx-atomic-i18n] Failed to persist language to localStorage.');
      expect(callArgs[1]).toBeInstanceOf(Error);

      Object.defineProperty(global, 'localStorage', { value: orig, configurable: true });
    });

  });

  describe('readySignal', () => {
    it('should return ready signal for namespace', () => {
      const readySignal = service.readySignal('test');
      expect(typeof readySignal).toBe('function');
    });
  });

  describe('load', () => {
    it('should load translations for namespace', async () => {
      await service.load('en:test', () => Promise.resolve({ key: 'value' }));
      expect(loaderMock.load).not.toHaveBeenCalled();
    });

    it('should log error when load fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      await expect(service.load('en:test', () => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('getAndCreateFormatter', () => {
    it('should return formatter for existing key', () => {
      // Mock internal cache
      service.addResourceBundle('en', 'test', { hello: 'world' });
      const formatter = service.getAndCreateFormatter('en:test', 'hello');
      expect(formatter).toBeDefined();
      expect(formatter?.format({})).toBe('world');
    });

    it('should return undefined for missing key', () => {
      const formatter = service.getAndCreateFormatter('en:test', 'missing');
      expect(formatter).toBeUndefined();
    });
  });

  describe('findFallbackFormatter', () => {
    it('should find fallback formatter', () => {
      service.setLang('en');
      service.addResourceBundle('en', 'common', { key: 'value' });
      const formatter = service.findFallbackFormatter('key', []);
      expect(formatter).toBeDefined();
    });

    it('should add missing key to cache per namespace', () => {
      // 先確保 cache 沒有
      const key = 'notfound';
      // 觸發 missing key（config fallbackNamespace 預設 'common'）
      service.findFallbackFormatter(key, []);
      // 再次呼叫仍會嘗試，但因為 namespace 標記為 missing 會快速跳過
      expect(service.findFallbackFormatter(key, [])).toBeUndefined();
    });

    it('should return undefined if key is in _missingKeyCache for the namespace', () => {
      const key = 'misskey';
      // 預設 fallbackNamespace 為 'common'
      (service as any)._missingKeyCache.add(`en:common:${key}`);
      service.setLang('en');
      expect(service.findFallbackFormatter(key, [])).toBeUndefined();
    });

    it('should skip all namespaces in findFallbackFormatter when excluded', () => {
      // 先 reset
      TestBed.resetTestingModule();
      // 先 override
      TestBed.configureTestingModule({
        providers: [
          {
            provide: TRANSLATION_CONFIG, useValue: {
              ...configMock,
              fallbackNamespace: ['common', 'extra']
            }
          },
          TranslationCoreService,
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: ICU_FORMATTER_TOKEN, useValue: icuFormatterMock },
          { provide: DOCUMENT, useValue: {} },
        ]
      });

      // 再 inject
      const service = TestBed.inject(TranslationCoreService);

      service.addResourceBundle('en', 'common', { a: '1' });
      service.addResourceBundle('en', 'extra', { a: '2' });

      const result = service.findFallbackFormatter('a', ['en:common', 'en:extra']);
      expect(result).toBeUndefined();
      expect(service.findFallbackFormatter('a', ['en:common', 'en:extra'])).toBeUndefined();
    });
  });

  describe('getAndCreateFormatter 分支測試', () => {
    it('should return cached formatter if present in fifoCache (nsKey includes namespace and version)', () => {
      const cacheKey = 'en:test:cached';
      const fakeFormatter = { format: () => 'cached!' };
      (service as any)._formatterCache.set('en:test:cached', fakeFormatter);
      // 把 lang() 設定成 'en'
      jest.spyOn(service, 'lang').mockReturnValue('en');
      const result = service.getAndCreateFormatter('en:test', 'cached');
      expect(result).toBe(fakeFormatter);
    });

    it('should return undefined if raw is undefined', () => {
      // 保證 cache 沒有且 jsonCache 沒資料
      expect(service.getAndCreateFormatter('en:test', 'notfound')).toBeUndefined();
    });

    it('should use ICU if provided', () => {
      // 模擬 _ICU 存在
      const ICUFake = jest.fn().mockImplementation((raw, lang) => ({
        format: () => 'ICU'
      }));
      Object.defineProperty(service, '_ICU', { value: ICUFake, configurable: true });
      service.addResourceBundle('en', 'test', { icu: '{count, plural, one {1 apple} other {# apples}}' });
      const formatter = service.getAndCreateFormatter('en:test', 'icu');
      expect(formatter?.format({ count: 2 })).toBe('ICU');
    });

    it('should hit ICU compiled cache across namespaces with same raw (exist branch)', () => {
      const ICUFake = jest.fn().mockImplementation((raw, lang) => ({ format: () => `${raw}-${lang}` }));
      Object.defineProperty(service, '_ICU', { value: ICUFake, configurable: true });
      // Same raw template in two namespaces
      service.addResourceBundle('en', 'ns1', { msg: 'hi {{name}}' });
      service.addResourceBundle('en', 'ns2', { msg: 'hi {{name}}' });
      const f1 = service.getAndCreateFormatter('en:ns1', 'msg');
      const f2 = service.getAndCreateFormatter('en:ns2', 'msg');
      expect(f1).toBeDefined();
      expect(f2).toBeDefined();
      // Second call should reuse compiled formatter (exist branch), so ICUFake constructed once
      expect(ICUFake).toHaveBeenCalledTimes(1);
      expect(f2?.format({ name: 'a' })).toBe('hi {{name}}-en');
    });
  });

  describe('preloadNamespaces', () => {
    it('should preload namespaces', async () => {
      await service.preloadNamespaces(['test'], 'en');
      expect(loaderMock.load).toHaveBeenCalled();
    });

    it('should skip preload if namespace is already loaded (cover 75-80)', async () => {
      // 手動加一個已經存在的 namespace
      service.addResourceBundle('en', 'loaded', { hi: 'hi' });
      // 應只呼叫 loader 一次
      await service.preloadNamespaces(['loaded', 'test'], 'en');
      expect(loaderMock.load).toHaveBeenCalledTimes(1);
      expect(loaderMock.load).toHaveBeenCalledWith(['i18n'], 'test', 'en');
    });

    it('should skip already loaded namespace in preloadNamespaces', async () => {
      service.addResourceBundle('en', 'test', { x: '1' });
      // loaderMock.load 不該被呼叫
      await service.preloadNamespaces(['test'], 'en');
      expect(loaderMock.load).not.toHaveBeenCalled();
    });
  });

  describe('removeResourceBundle evicts formatter cache by namespace', () => {
    it('should drop formatters for the removed namespace (all versions)', () => {
      service.addResourceBundle('en', 'ns', { k: 'old' });
      // create two cached formatters with different nsKey forms
      const f1 = service.getAndCreateFormatter('en:ns', 'k');
      const f2 = service.getAndCreateFormatter('en:ns:v1', 'k');
      expect(f1?.format({})).toBe('old');
      expect(f2?.format({})).toBe('old');

      // remove bundle and re-add with new value
      service.removeResourceBundle('en', 'ns');
      service.addResourceBundle('en', 'ns', { k: 'new' });

      const n1 = service.getAndCreateFormatter('en:ns', 'k');
      const n2 = service.getAndCreateFormatter('en:ns:v1', 'k');
      expect(n1?.format({})).toBe('new');
      expect(n2?.format({})).toBe('new');
    });

    it('should also clear missing-key entries for that namespace', () => {
      // inject a fake missing key for the target namespace
      (service as any)._missingKeyCache.add('en:ns:miss');
      expect((service as any)._missingKeyCache.has('en:ns:miss')).toBe(true);
      service.removeResourceBundle('en', 'ns');
      expect((service as any)._missingKeyCache.has('en:ns:miss')).toBe(false);
    });
  });

  describe('in-flight load coalescing', () => {
    it('should only fetch once for concurrent same nsKey', async () => {
      const fn = jest.fn().mockImplementation(() => new Promise<Translations>((resolve) => setTimeout(() => resolve({ a: '1' }), 0)));
      await Promise.all([
        service.load('en:co:ver', fn),
        service.load('en:co:ver', fn),
        service.load('en:co:ver', fn),
      ]);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear APIs', () => {
    it('clearAll should remove all caches and formatters', () => {
      service.addResourceBundle('en', 'ns', { k: 'v' });
      const f = service.getAndCreateFormatter('en:ns', 'k');
      expect(f).toBeDefined();

      service.clearAll();

      expect(service.hasResourceBundle('en', 'ns')).toBe(false);
      expect(service.getAndCreateFormatter('en:ns', 'k')).toBeUndefined();
    });

    it('clearLang should remove only specified language data and caches', () => {
      service.addResourceBundle('en', 'a', { k: '1' });
      service.addResourceBundle('zh-Hant', 'a', { k: '2' });
      expect(service.hasResourceBundle('en', 'a')).toBe(true);
      expect(service.hasResourceBundle('zh-Hant', 'a')).toBe(true);

      // add some missing keys for both languages to verify namespace clearing
      (service as any)._missingKeyCache.add('en:a:v1:miss1');
      (service as any)._missingKeyCache.add('zh-Hant:a:v1:miss2');
      const cache = (service as any)._formatterCache;
      cache.set('en:a:fmt', { format: () => 'en' });
      cache.set('zh-Hant:a:fmt', { format: () => 'zh' });

      service.clearLang('en');

      expect(service.hasResourceBundle('en', 'a')).toBe(false);
      expect(service.hasResourceBundle('zh-Hant', 'a')).toBe(true);
      expect((service as any)._missingKeyCache.has('en:a:v1:miss1')).toBe(false);
      expect((service as any)._missingKeyCache.has('zh-Hant:a:v1:miss2')).toBe(true);
      expect(cache.has('en:a:fmt')).toBe(false);
      expect(cache.has('zh-Hant:a:fmt')).toBe(true);
    });

    it('clearNamespace should delegate to removeResourceBundle', () => {
      service.addResourceBundle('en', 'b', { k: 'v' });
      expect(service.hasResourceBundle('en', 'b')).toBe(true);
      service.clearNamespace('en', 'b');
      expect(service.hasResourceBundle('en', 'b')).toBe(false);
    });

    it('clearLang should remove ICU compiled cache entries for that language', () => {
      // Pre-fill ICU compiled cache entries for two languages
      (service as any)._icuCompiledCache.set('raw1|en', { format: () => 'x' });
      (service as any)._icuCompiledCache.set('raw2|zh-Hant', { format: () => 'y' });
      expect((service as any)._icuCompiledCache.has('raw1|en')).toBe(true);
      expect((service as any)._icuCompiledCache.has('raw2|zh-Hant')).toBe(true);

      service.clearLang('en');

      expect((service as any)._icuCompiledCache.has('raw1|en')).toBe(false);
      expect((service as any)._icuCompiledCache.has('raw2|zh-Hant')).toBe(true);
    });
  });

  describe('addResourceBundle', () => {
    it('should add resource bundle', () => {
      const bundle = { key: 'value' };
      service.addResourceBundle('en', 'test', bundle);
      expect(service.hasResourceBundle('en', 'test')).toBe(true);
    });

    it('should preserve old keys if overwrite=false (cover 125-127)', () => {
      service.addResourceBundle('en', 'test', { a: '1', b: '2' });
      service.addResourceBundle('en', 'test', { b: '3' }, true, false);
      const bundle = service.getResourceBundle('en', 'test');
      expect(bundle).toEqual({ a: '1', b: '2' });
    });

    it('should preserve all old keys if deep=false and overwrite=false (cover 125-127)', () => {
      service.addResourceBundle('en', 'test', { a: '1', b: '2', c: 'old' });
      service.addResourceBundle('en', 'test', { b: '3' }, false, false);
      const bundle = service.getResourceBundle('en', 'test');
      expect(bundle).toEqual({ b: '3', a: '1', c: 'old' });
    });
  });

  describe('addResources', () => {
    it('should add resources', () => {
      const resources = { key: 'value' };
      service.addResources('en', 'test', resources);
      expect(service.hasResourceBundle('en', 'test')).toBe(true);
    });

    it('should clear _missingKeyCache when handleNewTranslations is called', () => {
      (service as any)._missingKeyCache.add('en:test:key');
      service.addResourceBundle('en', 'test', { hi: 'hi' });
      // 再加一筆新 json
      (service as any).handleNewTranslations({ foo: 'bar' }, 'en', 'test');
      expect((service as any)._missingKeyCache.size).toBe(0);
    });

    it('should evict formatter cache entries for namespace when handleNewTranslations is called', () => {
      const cache = (service as any)._formatterCache;
      cache.set('en:test:old', { format: () => 'old' });
      cache.set('en:other:keep', { format: () => 'keep' });

      (service as any).handleNewTranslations({ foo: 'bar' }, 'en', 'test');

      expect(cache.has('en:test:old')).toBe(false);
      expect(cache.has('en:other:keep')).toBe(true);
    });
  });

  describe('addResource', () => {
    it('should add single resource', () => {
      service.addResource('en', 'test', 'key', 'value');
      expect(service.getResource('en', 'test', 'key')).toBe('value');
    });
  });

  describe('hasResourceBundle', () => {
    it('should check if resource bundle exists', () => {
      expect(service.hasResourceBundle('en', 'test')).toBe(false);
      service.addResourceBundle('en', 'test', {});
      expect(service.hasResourceBundle('en', 'test')).toBe(true);
    });
  });

  describe('getResourceBundle', () => {
    it('should get resource bundle', () => {
      const bundle = { key: 'value' };
      service.addResourceBundle('en', 'test', bundle);
      expect(service.getResourceBundle('en', 'test')).toEqual(bundle);
    });
  });

  describe('removeResourceBundle', () => {
    it('should remove resource bundle', () => {
      service.addResourceBundle('en', 'test', {});
      service.removeResourceBundle('en', 'test');
      expect(service.hasResourceBundle('en', 'test')).toBe(false);
    });

    it('should only clear missing keys for the removed namespace', () => {
      service.addResourceBundle('en', 'test', {});
      (service as any)._missingKeyCache.add('en:test:key');
      (service as any)._missingKeyCache.add('en:other:key');

      service.removeResourceBundle('en', 'test');

      expect((service as any)._missingKeyCache.has('en:test:key')).toBe(false);
      expect((service as any)._missingKeyCache.has('en:other:key')).toBe(true);
    });
  });

  describe('getResource', () => {
    it('should get resource by key', () => {
      service.addResource('en', 'test', 'key', 'value');
      expect(service.getResource('en', 'test', 'key')).toBe('value');
    });
  });

  describe('Edge cases for uncovered branches', () => {
    it('should use default fallbackLang when config.fallbackLang is undefined (line 23)', () => {
      TestBed.resetTestingModule();
      const configWithoutFallback = {
        ...configMock,
        fallbackLang: undefined as any
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: TRANSLATION_CONFIG, useValue: configWithoutFallback },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: ICU_FORMATTER_TOKEN, useValue: icuFormatterMock },
          { provide: DOCUMENT, useValue: {} },
          TranslationCoreService,
        ]
      });
      const service = TestBed.inject(TranslationCoreService);
      expect(service.fallbackLang).toBe('en');
    });

    it('should use detectPreferredLang when lang parameter is undefined in setLang (line 34)', () => {
      service.setLang(undefined);
      expect(service.currentLang).toBe('en'); // 應該使用 detectPreferredLang 的結果
    });

    it('should return early when cache already exists in load method (line 54)', async () => {
      // 先加載一次
      await service.load('en:test', () => Promise.resolve({ key: 'value' }));

      // 清除 loader mock 的呼叫記錄
      loaderMock.load.mockClear();

      // 再次加載相同的 nsKey，應該早期返回
      await service.load('en:test', () => Promise.resolve({ key: 'new_value' }));

      // loader 不應該被呼叫
      expect(loaderMock.load).not.toHaveBeenCalled();
    });

    it('should use default empty string when fallbackNamespace is undefined (line 77)', () => {
      TestBed.resetTestingModule();
      const configWithoutFallbackNamespace = {
        ...configMock,
        fallbackNamespace: undefined as any
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: TRANSLATION_CONFIG, useValue: configWithoutFallbackNamespace },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: ICU_FORMATTER_TOKEN, useValue: icuFormatterMock },
          { provide: DOCUMENT, useValue: {} },
          TranslationCoreService,
        ]
      });
      const service = TestBed.inject(TranslationCoreService);

      // 添加一個空字串 namespace 的資源
      service.addResourceBundle('en', '', { fallback_key: 'fallback_value' });

      // 測試 findFallbackFormatter 會使用空字串作為 fallback namespace
      const formatter = service.findFallbackFormatter('fallback_key', []);
      expect(formatter).toBeDefined();
      expect(formatter?.format({})).toBe('fallback_value');
    });

    it('should handle i18nRoots as non-array in preloadNamespaces (line 89)', async () => {
      TestBed.resetTestingModule();
      const configWithStringRoots = {
        ...configMock,
        i18nRoots: 'single-root' as any // 不是陣列
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: TRANSLATION_CONFIG, useValue: configWithStringRoots },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: ICU_FORMATTER_TOKEN, useValue: icuFormatterMock },
          { provide: DOCUMENT, useValue: {} },
          TranslationCoreService,
        ]
      });
      const service = TestBed.inject(TranslationCoreService);

      await service.preloadNamespaces(['test'], 'en');

      // 應該將字串轉換為陣列並傳遞給 loader
      expect(loaderMock.load).toHaveBeenCalledWith(['single-root'], 'test', 'en');
    });
  });

  describe('Version-aware behavior', () => {
    it('readySignal should respect version match/mismatch', async () => {
      // load v1
      await service.load('en:test:v1', () => Promise.resolve({ hello: 'v1' }));
      const readyV1 = service.readySignal('test', 'v1');
      const readyV2 = service.readySignal('test', 'v2');
      expect(readyV1()).toBe(true);
      expect(readyV2()).toBe(false);
    });

    it('load should early-return for same version and fetch for different version', async () => {
      await service.load('en:test:v1', () => Promise.resolve({ a: '1' }));
      const fetchSame = jest.fn().mockResolvedValue({ a: '2' });
      await service.load('en:test:v1', fetchSame);
      expect(fetchSame).not.toHaveBeenCalled();

      const fetchDiff = jest.fn().mockResolvedValue({ a: '3' });
      await service.load('en:test:v2', fetchDiff);
      expect(fetchDiff).toHaveBeenCalledTimes(1);
    });

    it('missingKeyCache should be version- and namespace-scoped', () => {
      const key = 'absent_key';
      // v1 lookup → missing
      service.findFallbackFormatter(key, [], 'v1'); // namespace 'common' by default
      expect((service as any)._missingKeyCache.has(`en:common:v1:${key}`)).toBe(true);
      const sizeAfterV1 = (service as any)._missingKeyCache.size;

      // v2 lookup should not be blocked by v1 entry (still ends missing, but adds another record)
      service.findFallbackFormatter(key, [], 'v2');
      expect((service as any)._missingKeyCache.size).toBe(sizeAfterV1 + 1);
      expect((service as any)._missingKeyCache.has(`en:common:v2:${key}`)).toBe(true);
    });

    it('formatter should format correctly for different versions (nsKey)', () => {
      service.addResourceBundle('en', 'test', { greet: 'hello' });
      const f1 = service.getAndCreateFormatter('en:test:v1', 'greet');
      const f2 = service.getAndCreateFormatter('en:test:v2', 'greet');
      expect(f1).toBeDefined();
      expect(f2).toBeDefined();
      expect(f1?.format({})).toBe('hello');
      expect(f2?.format({})).toBe('hello');
    });
  });

  describe('logging helpers', () => {
    it('should log zero keys when json is not an object', () => {
      (service as any).debugEnabled = true;
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => { });

      (service as any).handleNewTranslations('not-object' as any, 'en', 'ns', undefined);

      expect(infoSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
    });

    it('should log with and without details when debug enabled', () => {
      (service as any).debugEnabled = true;
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => { });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      (service as any).log('msg-only');
      (service as any).log('msg-with-detail', { a: 1 });
      (service as any).error('err', new Error('boom'));
      (service as any).warn('warn-only');
      (service as any).warn('warn-detail', { b: 2 });
      expect(infoSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should log cache detail when debug enabled', () => {
      (service as any).debugEnabled = true;
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => { });
      (service as any).handleNewTranslations({ a: '1' }, 'en', 'ns', undefined);
      expect(infoSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
    });

    it('should run error/warn when debug enabled', () => {
      (service as any).debugEnabled = true;
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
      (service as any).error('oops', new Error('fail'));
      (service as any).warn('warn-msg');
      expect(errorSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('should skip error/warn/log when debug disabled', () => {
      (service as any).debugEnabled = false;
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => { });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      (service as any).handleNewTranslations({ a: '1' }, 'en', 'ns', undefined);
      (service as any).error('oops', new Error('fail'));
      (service as any).warn('warn-msg');
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('getAllBundle', () => {
    it('should return underlying json cache map', () => {
      service.addResourceBundle('en', 'ns', { a: '1' });
      const map = service.getAllBundle();
      expect(map instanceof Map).toBe(true);
      expect(map.get('en')?.get('ns')).toEqual({ a: '1' });
    });
  });
});
