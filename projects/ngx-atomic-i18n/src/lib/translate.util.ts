import { effect, Provider, Signal } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_NAMESPACE } from "./translate.token";
import { MissingTranslationBehavior, TranslationConfig } from "./translate.type";
import { Observable } from "rxjs";
import { TranslationService } from "./translation.service";

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

export function provideTranslationConfig(config: Partial<TranslationConfig>): Provider[] {
    const finalConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'zh-Hant',
        initialLang: 'zh-Hant',
        i18nRoot: 'i18n',
        missingTranslationBehavior: MissingTranslationBehavior.SHOW_KEY,
        ...config,
    };
    return [{
        provide: TRANSLATION_CONFIG,
        useValue: finalConfig,
    },
    ...provideTranslation('common')
    ];
}

export function provideTranslation(namespace: string): Provider[] {
    console.log('aa-provideTranslation', namespace)
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

export function parseICU(templateText: string, params?: Record<string, string | number>): string {
    if (!params) return templateText;

    const paramMap: Record<string, string> = {};
    for (const [key, val] of Object.entries(params)) {
        paramMap[key] = String(val);
    }

    function extractBlock(text: string, startIndex: number): [string, number] {
        let depth = 0;
        let i = startIndex;
        while (i < text.length) {
            if (text[i] === '{') {
                if (depth === 0) startIndex = i;
                depth++;
            } else if (text[i] === '}') {
                depth--;
                if (depth === 0) return [text.slice(startIndex, i + 1), i + 1];
            }
            i++;
        }
        return ['', i];
    }

    function extractOptions(body: string): Record<string, string> {
        const options: Record<string, string> = {};
        let i = 0;
        while (i < body.length) {
            while (body[i] === ' ') i++;

            let key = '';
            while (i < body.length && body[i] !== '{' && body[i] !== ' ') {
                key += body[i++];
            }

            while (i < body.length && body[i] !== '{') i++;
            if (body[i] !== '{') continue;

            const [block, next] = extractBlock(body, i);
            options[key] = block.slice(1, -1);
            i = next;
        }
        return options;
    }

    function resolveICU(text: string): string {
        text = text.replace(/\{\{(\w+)\}\}/g, (_, key) => paramMap[key] ?? '');
        let result = '';
        let cursor = 0;

        while (cursor < text.length) {
            const start = text.indexOf('{', cursor);
            if (start === -1) {
                result += text.slice(cursor);
                break;
            }

            result += text.slice(cursor, start);

            const [block, nextIndex] = extractBlock(text, start);
            const match = block.match(/^\{(\w+),\s*(plural|select),/);
            if (!match) {
                result += block;
                cursor = nextIndex;
                continue;
            }

            const [, varName, type] = match;
            const rawVal = paramMap[varName] ?? '';
            const numVal = Number(rawVal);
            const body = block.slice(match[0].length, -1);
            const options = extractOptions(body);

            const selected =
                options[`=${rawVal}`] ||
                (type === 'plural' && numVal === 1 && options['one']) ||
                options[rawVal] ||
                options['other'] ||
                '';

            // 遞迴處理巢狀 ICU
            let resolved = resolveICU(selected);

            // `#` 替代符：僅在 plural 使用
            if (type === 'plural') {
                resolved = resolved.replace(/#/g, rawVal);
            }

            // `{{var}}` 插值
            result += resolved;
            cursor = nextIndex;
        }

        return result;
    }

    const resolved = resolveICU(templateText);
    return resolved.replace(/\{\{(\w+)\}\}/g, (_, k) => paramMap[k] ?? '').trim();
}


export function toObservable<T>(signal: Signal<T>): Observable<T> {
    return new Observable(subscribe => {
        const stop = effect(() => subscribe.next(signal()));
        return () => stop;
    })
}