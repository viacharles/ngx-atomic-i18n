import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslationCoreService } from './translation-core.service';
import { signal } from '@angular/core';
import { BUILD_VERSION, TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE } from './translate.token';
import { Translations } from './translate.type';

describe('TranslationService', () => {
  let service: TranslationService;
  let configMock: any;
  let coreServiceMock: any;
  let loaderMock: any;

  beforeEach(() => {
    configMock = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'test',
      missingTranslationBehavior: 'show-key',
      debug: true
    };
    coreServiceMock = {
      lang: jest.fn().mockReturnValue('en'),
      currentLang: 'en',
      setLang: jest.fn(),
      readySignal: jest.fn((ns) => signal(false)),
      getAndCreateFormatter: jest.fn(),
      findFallbackFormatter: jest.fn(function (key: string, exclude: string[]) {
        return coreServiceMock.getAndCreateFormatter('en:test', key);
      }),
      addResourceBundle: jest.fn(),
      addResources: jest.fn(),
      addResource: jest.fn(),
      hasResourceBundle: jest.fn(),
      getResource: jest.fn(),
      getResourceBundle: jest.fn(),
      getAllBundle: jest.fn(),
      removeResourceBundle: jest.fn(),
      preloadNamespaces: jest.fn(),
      load: jest.fn(),
    };
    loaderMock = {
      load: jest.fn().mockResolvedValue({ hello: 'world' })
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: TRANSLATION_CONFIG, useValue: configMock },
        { provide: TRANSLATION_LOADER, useValue: loaderMock },
        { provide: TRANSLATION_NAMESPACE, useValue: 'test' },
        { provide: TranslationCoreService, useValue: coreServiceMock },
        TranslationService  // ← 讓 Angular 幫你建立真正 instance
      ]
    });
    service = TestBed.inject(TranslationService); // ← 這才是 instance，不是 mock
  });

  describe('lang', () => {
    it('should return language signal', () => {
      expect(service.lang()).toBe('en');
    });
  });

  describe('currentLang', () => {
    it('should return current language', () => {
      expect(service.currentLang).toBe('en');
    });
  });

  describe('supportedLangs', () => {
    it('should return supported languages', () => {
      expect(service.supportedLangs).toEqual(['en', 'zh-Hant']);
    });
  });

  describe('getNskey', () => {
    it('should return namespace key', () => {
      expect(service.getNskey).toBe('en:test');
    });
    it('should include build version when provided', () => {
      TestBed.resetTestingModule();
      const coreServiceMock2 = { ...coreServiceMock, readySignal: jest.fn(() => signal(false)) };
      TestBed.configureTestingModule({
        providers: [
          { provide: TRANSLATION_CONFIG, useValue: configMock },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: TRANSLATION_NAMESPACE, useValue: 'test' },
          { provide: BUILD_VERSION, useValue: 'vh1' },
          { provide: TranslationCoreService, useValue: coreServiceMock2 },
          TranslationService
        ]
      });
      const s = TestBed.inject(TranslationService);
      expect(s.getNskey).toBe('en:test:vh1');
    });
  });

  describe('readySignal', () => {
    it('should return ready signal', () => {
      const readySignal = service.readySignal;
      expect(typeof readySignal).toBe('function');
    });
  });

  describe('ready', () => {
    it('should return ready status', () => {
      expect(service.ready).toBe(false);
    });
  });

  describe('setLang', () => {
    it('should set language', () => {
      service.setLang('zh-Hant');
      expect(coreServiceMock.setLang).toHaveBeenCalledWith('zh-Hant');
    });
  });

  describe('t', () => {
    it('should translate key when ready', () => {
      coreServiceMock.readySignal.mockImplementation(() => signal(true));
      const result = service.t('hello');
      expect(result).toBe('hello');
    });

    it('should return missing translation when not ready', () => {
      coreServiceMock.readySignal.mockReturnValue(signal(false));
      const result = service.t('hello');
      expect(result).toBe('');
    });

    it('should handle params', () => {
      coreServiceMock.readySignal.mockImplementation(() => signal(true));
      coreServiceMock.getAndCreateFormatter.mockImplementationOnce(() => ({
        format: (params: Translations) => `hello ${params['name']}`
      }));
      const result = service.t('hello', { name: 'world' });
      expect(result).toBe('hello world');
    });

    it('should use fallback when formatter not found', () => {
      let callCount = 0; // 放最外層！

      // 先建好 mock，再放進 configureTestingModule
      const coreServiceMockLocal: any = {
        ...coreServiceMock,
        readySignal: jest.fn((ns) => signal(true)),
        getAndCreateFormatter: jest.fn((nsKey, key) => {
          callCount++;
          if (callCount === 1) return undefined;
          if (callCount === 2) return { format: () => 'fallback' };
          return undefined;
        }),
        findFallbackFormatter: jest.fn(function (key: string, exclude: string[]) {
          // 用 coreServiceMockLocal，不要 coreServiceMock
          return coreServiceMockLocal.getAndCreateFormatter('en:test', key);
        })
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: TRANSLATION_CONFIG, useValue: configMock },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: TRANSLATION_NAMESPACE, useValue: 'test' },
          { provide: TranslationCoreService, useValue: coreServiceMockLocal },
          TranslationService
        ]
      });

      const service = TestBed.inject(TranslationService);

      const result = service.t('hello');
      expect(result).toBe('fallback');
    });


    it('should return missing translation when no fallback', () => {
      coreServiceMock.getAndCreateFormatter.mockReturnValue(undefined);
      coreServiceMock.findFallbackFormatter = jest.fn((key, exclude) => {
        return coreServiceMock.getAndCreateFormatter('en:test', key);
      });
      const result = service.t('hello');
      expect(result).toBe('');
    });

    it('should delegate to parent when page fallback enabled', () => {
      coreServiceMock.readySignal.mockImplementation(() => signal(true));
      coreServiceMock.getAndCreateFormatter.mockReturnValue(undefined);
      coreServiceMock.findFallbackFormatter = jest.fn().mockReturnValue(undefined);
      (configMock as any).enablePageFallback = true;
      (service as any).isPageRoot = false;
      (service as any).parent = { t: jest.fn().mockReturnValue('from-parent') };
      const result = service.t('hello');
      expect(result).toBe('from-parent');
    });
  });

  describe('addResourceBundle', () => {
    it('should delegate to core service', () => {
      service.addResourceBundle('en', 'test', { key: 'value' });
      expect(coreServiceMock.addResourceBundle).toHaveBeenCalledWith('en', 'test', { key: 'value' });
    });
  });

  describe('utility delegates and logging', () => {
    it('should expose getAllBundle from core', () => {
      coreServiceMock.getAllBundle.mockReturnValue(new Map([['en', new Map()]]));
      expect(service.getAllBundle()).toBeInstanceOf(Map);
    });

    it('should log info/warn when debug enabled', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => { });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
      (service as any).debugEnabled = true;
      (service as any).info('msg');
      (service as any).info('msg', { x: 1 });
      (service as any).warn('warn');
      (service as any).warn('warn', { y: 2 });
      expect(infoSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('should skip info/warn when debug disabled', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => { });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
      (service as any).debugEnabled = false;
      (service as any).info('msg');
      (service as any).warn('warn');
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('addResources', () => {
    it('should delegate to core service', () => {
      service.addResources('en', 'test', { key: 'value' });
      expect(coreServiceMock.addResources).toHaveBeenCalledWith('en', 'test', { key: 'value' });
    });
  });

  describe('addResource', () => {
    it('should delegate to core service', () => {
      service.addResource('en', 'test', 'key', 'value');
      expect(coreServiceMock.addResource).toHaveBeenCalledWith('en', 'test', 'key', 'value');
    });
  });

  describe('hasResourceBundle', () => {
    it('should delegate to core service', () => {
      service.hasResourceBundle('en', 'test');
      expect(coreServiceMock.hasResourceBundle).toHaveBeenCalledWith('en', 'test');
    });
  });

  describe('getResource', () => {
    it('should delegate to core service', () => {
      service.getResource('en', 'test', 'key');
      expect(coreServiceMock.getResource).toHaveBeenCalledWith('en', 'test', 'key');
    });
  });

  describe('getResourceBundle', () => {
    it('should delegate to core service', () => {
      service.getResourceBundle('en', 'test');
      expect(coreServiceMock.getResourceBundle).toHaveBeenCalledWith('en', 'test');
    });
  });

  describe('removeResourceBundle', () => {
    it('should delegate to core service', () => {
      service.removeResourceBundle('en', 'test');
      expect(coreServiceMock.removeResourceBundle).toHaveBeenCalledWith('en', 'test');
    });
  });

  describe('preloadNamespaces', () => {
    it('should delegate to core service', () => {
      service.preloadNamespaces(['test'], 'en');
      expect(coreServiceMock.preloadNamespaces).toHaveBeenCalledWith(['test'], 'en');
    });
  });

  describe('missing translation behavior', () => {
    it('should throw error when configured', () => {
      configMock.missingTranslationBehavior = 'throw-error';
      coreServiceMock.readySignal.mockReturnValue(signal(false));
      expect(() => service.t('hello')).toThrow();
    });

    it('should return empty string when configured', () => {
      configMock.missingTranslationBehavior = 'empty';
      coreServiceMock.readySignal.mockReturnValue(signal(false));
      const expected = '';
      expect(service.t('hello')).toBe(expected);
    });

    it('should show key when ready but missing and show-key mode', () => {
      coreServiceMock.readySignal.mockImplementation(() => signal(true));
      coreServiceMock.getAndCreateFormatter.mockReturnValue(undefined);
      const result = service.t('missing-key');
      expect(result).toBe('missing-key');
    });

    it('should return custom string when configured', () => {
      configMock.missingTranslationBehavior = '--';
      coreServiceMock.readySignal.mockReturnValue(signal(false));
      expect(service.t('hello')).toBe('');
    });

    it('should use fallback formatter when available', () => {
      coreServiceMock.readySignal.mockImplementation(() => signal(true));
      const fb = { format: () => 'from-fallback' };
      coreServiceMock.getAndCreateFormatter.mockReturnValue(undefined);
      coreServiceMock.findFallbackFormatter = jest.fn().mockReturnValue(fb as any);
      const result = service.t('missing-key');
      expect(result).toBe('from-fallback');
    });
  });

  describe('Edge cases for uncovered branches', () => {
    it('should use default missingTranslationBehavior when undefined (line 68)', () => {
      TestBed.resetTestingModule();
      const configWithoutBehavior = {
        ...configMock,
        missingTranslationBehavior: undefined
      };
      TestBed.configureTestingModule({
        providers: [
          { provide: TRANSLATION_CONFIG, useValue: configWithoutBehavior },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: TRANSLATION_NAMESPACE, useValue: 'test' },
          { provide: TranslationCoreService, useValue: coreServiceMock },
          TranslationService
        ]
      });

      const service = TestBed.inject(TranslationService);
      coreServiceMock.readySignal.mockReturnValue(signal(false));

      // 應該使用預設的 'show-key' 行為
      const result = service.t('hello');
      expect(result).toBe('');
    });

    it('should return empty string when key is undefined in show-key forceMode (line 73)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: TRANSLATION_CONFIG, useValue: configMock },
          { provide: TRANSLATION_LOADER, useValue: loaderMock },
          { provide: TRANSLATION_NAMESPACE, useValue: 'test' },
          { provide: TranslationCoreService, useValue: coreServiceMock },
          TranslationService
        ]
      });

      const service = TestBed.inject(TranslationService);
      coreServiceMock.readySignal.mockReturnValue(signal(false));

      // 測試當 key 為 undefined 時的情況
      const result = service.t(undefined as any);
      expect(result).toBe('');
    });
  });
});
