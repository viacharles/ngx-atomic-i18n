import 'jest';
import { TranslationCoreService } from './translation-core.service';
import { TranslationConfig } from './translate.type';

describe('TranslationCoreService', () => {
  let service: TranslationCoreService;
  let configMock: TranslationConfig;
  let loaderMock: any;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    configMock = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      missingTranslationBehavior: 'show-key'
    };
    loaderMock = {
      load: jest.fn().mockResolvedValue({ hello: 'world' })
    };
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    // Mock inject
    jest.spyOn(require('@angular/core'), 'inject').mockImplementation((token: any) => {
      if (token.toString().includes('TRANSLATION_CONFIG')) return configMock;
      if (token.toString().includes('TRANSLATION_LOADER')) return loaderMock;
      return null;
    });
    service = new TranslationCoreService();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

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
      service.setLang('zh-Hant');
      expect(service.currentLang).toBe('zh-Hant');
    });

    it('should not set unsupported language', () => {
      service.setLang('fr');
      expect(service.currentLang).toBe('en');
      expect(consoleWarnSpy).toHaveBeenCalled();
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
  });

  describe('getAndCreateFormatter', () => {
    it('should return formatter for existing key', () => {
      // Mock internal cache
      const mockCache = new Map();
      mockCache.set('en', new Map());
      mockCache.get('en').set('test', { hello: 'world' });
      Object.defineProperty(service, '_jsonCache', {
        value: { get: () => mockCache }
      });
      const formatter = service.getAndCreateFormatter('en:test', 'hello');
      expect(formatter).toBeDefined();
    });

    it('should return undefined for missing key', () => {
      const formatter = service.getAndCreateFormatter('en:test', 'missing');
      expect(formatter).toBeUndefined();
    });
  });

  describe('findFallbackFormatter', () => {
    it('should find fallback formatter', () => {
      const formatter = service.findFallbackFormatter('key', []);
      expect(formatter).toBeDefined();
    });
  });

  describe('preloadNamespaces', () => {
    it('should preload namespaces', async () => {
      await service.preloadNamespaces(['test'], 'en');
      expect(loaderMock.load).toHaveBeenCalled();
    });
  });

  describe('addResourceBundle', () => {
    it('should add resource bundle', () => {
      const bundle = { key: 'value' };
      service.addResourceBundle('en', 'test', bundle);
      expect(service.hasResourceBundle('en', 'test')).toBe(true);
    });
  });

  describe('addResources', () => {
    it('should add resources', () => {
      const resources = { key: 'value' };
      service.addResources('en', 'test', resources);
      expect(service.hasResourceBundle('en', 'test')).toBe(true);
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
  });

  describe('getResource', () => {
    it('should get resource by key', () => {
      service.addResource('en', 'test', 'key', 'value');
      expect(service.getResource('en', 'test', 'key')).toBe('value');
    });
  });
});
