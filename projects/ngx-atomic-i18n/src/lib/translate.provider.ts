import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, Provider } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE, TranslationConfig, TranslationService } from "ngx-atomic-i18n";
import { HttpTranslationLoader } from "./translation.loader.csr";
import { userTranslationConfig } from "./cli-init-config";

export function provideTranslationInit(config?: Partial<TranslationConfig>): Provider[] {
    const finalConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'zh-Hant',
        initialLang: 'zh-Hant',
        i18nRoots: ['i18n'],
        missingTranslationBehavior: 'show-key',
        parserType: 'lite',
        ...userTranslationConfig,
        ...config,
    } as TranslationConfig;
    return [{
        provide: TRANSLATION_CONFIG,
        useValue: finalConfig,
    },
    ...provideTranslationLoader(),
    ...provideTranslation('common'),
    {
        provide: APP_INITIALIZER,
        useFactory: (ts: TranslationService) => {
            return () => ts.setLang(ts.currentLang());
        },
        deps: [TranslationService],
        multi: true
    }
    ];
}

export function provideTranslation(namespace: string): Provider[] {
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