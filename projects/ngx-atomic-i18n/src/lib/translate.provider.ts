import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, Provider } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE, TranslationConfig, TranslationService } from "ngx-atomic-i18n";
import { HttpTranslationLoader } from "./translation.loader.csr";
import { detectPreferredLang } from "./translate.util";

export function provideTranslationInit(userConfig?: Partial<TranslationConfig>): Provider[] {
    const defaultCongig = {
        supportedLangs: ['en'],
        fallbackNamespace: 'common',
        fallbackLang: 'en',
        initialLang: 'en',
        i18nRoots: ['i18n'],
        missingTranslationBehavior: 'show-key',
    };
    const finalConfig = {
        ...defaultCongig,
        ...userConfig,
    } as TranslationConfig;
    const preferredLang = detectPreferredLang(finalConfig);
    return [
        {
            provide: TRANSLATION_CONFIG,
            useValue: {
                ...finalConfig,
                initialLang: preferredLang
            },
        },
        ...provideTranslationLoader(),
        ...provideTranslation(finalConfig.fallbackNamespace),
        {
            provide: APP_INITIALIZER,
            useFactory: (ts: TranslationService) => {
                return async () => {
                    const preload = finalConfig.preloadNamespaces;
                    if (preload?.length) {
                        await ts.preloadNamespaces(preload, preferredLang);
                    }
                    ts.setLang(ts.currentLang);
                }
            },
            deps: [TranslationService],
            multi: true
        }
    ];
}

export function provideTranslation(namespace: string | string[]): Provider[] {
    return [
        {
            provide: TRANSLATION_NAMESPACE,
            useValue: namespace,
        },
        {
            provide: TranslationService,
            useClass: TranslationService
        }
    ]
}

export function provideTranslationLoader(): Provider[] {
    return [
        {
            provide: TRANSLATION_LOADER,
            useClass: HttpTranslationLoader,
            deps: [HttpClient],
        },

    ]
}