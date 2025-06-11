import { inject, Provider } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_CONTEXT } from "./translate.token";
import { LazyLoader, TranslationConfig, TranslationContext, Translations } from "./translate.type";
import { HttpClient } from "@angular/common/http";
import { TranslationService } from "ngx-atomic-i18n";
import { firstValueFrom } from "rxjs";

export function detectPreferredLang(config: TranslationConfig): string {
    const { supportedLangs, fallbackLang, staticLang } = config;
    const isNode = typeof window === 'undefined';
    if (isNode && staticLang && supportedLangs.includes(staticLang)) return staticLang;
    const stored = isNode ? null : localStorage.getItem('lang');
    if (stored && supportedLangs.includes(stored)) return stored;
    const urlLang = isNode ? null : window.location.pathname.split('/')[1];
    if (urlLang && supportedLangs.includes(urlLang)) return urlLang;
    const browserLang = (globalThis as any)?.navigator?.language?.split('-')[0];
    if (browserLang && supportedLangs.includes(browserLang)) return browserLang;
    return fallbackLang;
}

export function provideTranslationConfig(config: Partial<TranslationConfig>): Provider {
    return {
        provide: TRANSLATION_CONFIG,
        useValue: {
            supportedLangs: ['en', 'zh-Hant'],
            fallbackLang: 'zh-Ho',
            initialLang: 'zh-Hant',
            i18nRoot: 'assets',
            ...config,
        },
    };
}

export function provideTranslation(namespace: string): Provider[] {
    return [
        {
            provide: TRANSLATION_CONTEXT,
            useFactory: () => {
                const config = inject(TRANSLATION_CONFIG);
                const http = inject(HttpClient);
                const ts = inject(TranslationService);
                const supportedLangs = config.supportedLangs;
                const i18nRoots = Array.isArray(config.i18nRoot) ? config.i18nRoot : [config.i18nRoot];
                const lazyLoader: LazyLoader = {};
                for (const lang of supportedLangs) {
                    for (const root of i18nRoots) {
                        const path = `${root}/${namespace}/${lang}.json`;
                        lazyLoader[lang] = async () => {
                            return await firstValueFrom(http.get<Translations>(path));
                        }
                    }
                };
                const context = { namespace, lazyLoader };
                ts.setContext(context);
                ts.setLang(ts.currentLang());
                return context as TranslationContext;
            }
        }
    ]
}