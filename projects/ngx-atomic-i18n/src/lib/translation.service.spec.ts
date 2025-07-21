import 'jest';
import { TranslationService } from './translation.service';
import { TranslationConfig } from './translate.type';

describe('TranslationService', () => {
    let service: TranslationService;
    let configMock: TranslationConfig;
    let coreServiceMock: any;
    let loaderMock: any;

    beforeEach(() => {
        configMock = {
            supportedLangs: ['en', 'zh-Hant'],
            fallbackLang: 'en',
            i18nRoots: ['i18n'],
            fallbackNamespace: 'common',
            missingTranslationBehavior: 'show-key'
        };
        coreServiceMock = {
            lang: jest.fn().mockReturnValue('en'),
            currentLang: 'en',
            setLang: jest.fn(),
            readySignal: jest.fn().mockReturnValue(true),
            getAndCreateFormatter: jest.fn().mockReturnValue({ format: () => 'translated' }),
            findFallbackFormatter: jest.fn().mockReturnValue({ format: () => 'fallback' }),
            addResourceBundle: jest.fn(),
            addResources: jest.fn(),
            addResource: jest.fn(),
            hasResourceBundle: jest.fn(),
            getResource: jest.fn(),
            getResourceBundle: jest.fn(),
            removeResourceBundle: jest.fn(),
            preloadNamespaces: jest.fn()
        };
        loaderMock = {
            load: jest.fn().mockResolvedValue({ hello: 'world' })
        };
        // Mock inject
        jest.spyOn(require('@angular/core'), 'inject').mockImplementation((token: any) => {
            if (token.toString().includes('TRANSLATION_CONFIG')) return configMock;
            if (token.toString().includes('TRANSLATION_LOADER')) return loaderMock;
            return null;
        });
        // Mock TranslationCoreService
        jest.spyOn(require('./translation-core.service'), 'TranslationCoreService').mockImplementation(() => coreServiceMock);
        service = new TranslationService('test');
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
    });

    describe('readySignal', () => {
        it('should return ready signal', () => {
            const readySignal = service.readySignal;
            expect(typeof readySignal).toBe('function');
        });
    });

    describe('ready', () => {
        it('should return ready status', () => {
            expect(service.ready).toBe(true);
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
            const result = service.t('hello');
            expect(result).toBe('translated');
        });

        it('should return missing translation when not ready', () => {
            coreServiceMock.readySignal.mockReturnValue(false);
            const result = service.t('hello');
            expect(result).toBe('hello');
        });

        it('should handle params', () => {
            const result = service.t('hello', { name: 'world' });
            expect(result).toBe('translated');
        });

        it('should use fallback when formatter not found', () => {
            coreServiceMock.getAndCreateFormatter.mockReturnValue(undefined);
            const result = service.t('hello');
            expect(result).toBe('fallback');
        });

        it('should return missing translation when no fallback', () => {
            coreServiceMock.getAndCreateFormatter.mockReturnValue(undefined);
            coreServiceMock.findFallbackFormatter.mockReturnValue(undefined);
            const result = service.t('hello');
            expect(result).toBe('hello');
        });
    });

    describe('addResourceBundle', () => {
        it('should delegate to core service', () => {
            service.addResourceBundle('en', 'test', { key: 'value' });
            expect(coreServiceMock.addResourceBundle).toHaveBeenCalledWith('en', 'test', { key: 'value' });
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
            configMock.missingTranslationBehavior = 'throw';
            coreServiceMock.readySignal.mockReturnValue(false);
            expect(() => service.t('hello')).toThrow();
        });

        it('should return empty string when configured', () => {
            configMock.missingTranslationBehavior = 'empty';
            coreServiceMock.readySignal.mockReturnValue(false);
            expect(service.t('hello')).toBe('');
        });

        it('should return custom string when configured', () => {
            configMock.missingTranslationBehavior = '--';
            coreServiceMock.readySignal.mockReturnValue(false);
            expect(service.t('hello')).toBe('--');
        });
    });
}); 