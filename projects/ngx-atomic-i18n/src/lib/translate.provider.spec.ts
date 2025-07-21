import { provideTranslationInit, provideTranslation, provideTranslationLoader } from './translate.provider';

describe('translate.provider', () => {
    describe('provideTranslationInit', () => {
        it('should return providers with default config', () => {
            const providers = provideTranslationInit();
            expect(Array.isArray(providers)).toBe(true);
            expect(providers.length).toBeGreaterThan(0);
        });
        it('should merge user config', () => {
            const providers = provideTranslationInit({ supportedLangs: ['en', 'zh-Hant'], initialLang: () => 'zh-Hant' });
            const flatProviders = providers.flat ? providers.flat() : providers;
            const configProvider = flatProviders.find((p: any) => p && p.provide && p.provide.toString().includes('TRANSLATION_CONFIG'));
            expect(configProvider).toBeTruthy();
            expect(configProvider && configProvider.useValue.supportedLangs).toContain('zh-Hant');
        });
    });

    describe('provideTranslation', () => {
        it('should provide namespace and service', () => {
            const providers = provideTranslation('test');
            const flatProviders = providers.flat ? providers.flat() : providers;
            expect(flatProviders.some((p: any) => p && p.provide && p.provide.toString().includes('TRANSLATION_NAMESPACE'))).toBe(true);
            expect(flatProviders.some((p: any) => p && p.provide && p.provide.name === 'TranslationService')).toBe(true);
        });
    });

    describe('provideTranslationLoader', () => {
        it('should provide translation loader', () => {
            const providers = provideTranslationLoader();
            const flatProviders = providers.flat ? providers.flat() : providers;
            expect(flatProviders.some((p: any) => p && p.provide && p.provide.toString().includes('TRANSLATION_LOADER'))).toBe(true);
        });
    });
}); 