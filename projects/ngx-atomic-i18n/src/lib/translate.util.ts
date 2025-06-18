import { effect, inject, Provider, Signal } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_CONTEXT } from "./translate.token";
import { Params, TranslationConfig, TranslationContext } from "./translate.type";
import { TranslationService } from "ngx-atomic-i18n";
import { Observable } from "rxjs";

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
            i18nRoot: 'i18n',
            ...config,
        },
    };
}

export function provideTranslation(namespace: string): Provider[] {
    console.log('aa-provideTranslation', namespace)
    return [
        {
            provide: TRANSLATION_CONTEXT,
            useFactory: () => {
                console.log('aa-provideTranslation useFactory', namespace)
                const ts = inject(TranslationService);
                const lang = ts.currentLang();
                ts.ensureLoaded(lang, namespace);
                const ready = ts.getReadySignal(lang, namespace);
                return {
                    namespace,
                    ready,
                } satisfies TranslationContext;
            }
        }
    ]
}

export function parseICU(templateText: string, params?: Params): string {
    if (!params) return templateText;
    const strParams = Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
    );

    function parseICUBlock(s: string, start: number): [string, number] {
        let depth = 0;
        let i = start;
        while (i < s.length) {
            if (s[i] === '{') depth++;
            else if (s[i] === '}') {
                depth--;
                if (depth === 0) return [s.slice(start, i + 1), i + 1];
            }
            i++;
        }
        return ['', start];
    }

    function parseOptions(body: string): Record<string, string> {
        const options: Record<string, string> = {};
        let i = 0;
        while (i < body.length) {
            while (body[i] === ' ') i++;
            let key = '';
            while (body[i] !== '{' && body[i] !== ' ' && i < body.length) key += body[i++];
            while (body[i] !== '{' && i < body.length) i++;
            if (body[i] !== '{') continue;
            const [block, next] = parseICUBlock(body, i);
            options[key] = block.slice(1, -1); // remove outer {}
            i = next;
        }
        return options;
    }

    let result = '';
    let i = 0;
    while (i < templateText.length) {
        const icuStart = templateText.indexOf('{', i);
        if (icuStart === -1) break;

        result += templateText.slice(i, icuStart);
        const [icuBlock, end] = parseICUBlock(templateText, icuStart);
        const match = icuBlock.match(/^\{(\w+),\s*(plural|select),/);
        if (!match) {
            result += icuBlock;
            i = end;
            continue;
        }

        const [, varName, type] = match;
        const body = icuBlock.slice(match[0].length, -1);
        const options = parseOptions(body);
        const val = strParams[varName] ?? '';
        const chosen = options[`=${val}`] || options[val] || options['other'] || '';
        const interpolated = chosen.replace(/\{\{(\w+)\}\}/g, (_, k) => strParams[k] ?? '');
        result += interpolated;
        i = end;
    }

    result += templateText.slice(i);
    return result.replace(/\{\{(\w+)\}\}/g, (_, k) => strParams[k] ?? '').trim();
}

export function toObservable<T>(signal: Signal<T>): Observable<T> {
    return new Observable(subscribe => {
        const stop = effect(() => subscribe.next(signal()));
        return () => stop;
    })
}