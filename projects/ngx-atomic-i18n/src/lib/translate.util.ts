import { effect, Signal } from "@angular/core";
import { TranslationConfig, Translations } from "./translate.type";
import { Observable } from "rxjs";

export function detectPreferredLang(config: TranslationConfig): string {
    const { supportedLangs, fallbackLang } = config;
    const isNode = typeof window === 'undefined';
    const initialLang = typeof config.initialLang === 'function'
        ? config.initialLang() : config.initialLang;
    if (isNode && initialLang && supportedLangs.includes(initialLang)) return initialLang;
    const stored = isNode ? null : localStorage.getItem('lang');
    if (stored && supportedLangs.includes(stored)) return stored;
    const urlLang = isNode ? null : window.location.pathname.split('/')[1];
    if (urlLang && supportedLangs.includes(urlLang)) return urlLang;
    const browserLang = (globalThis as any)?.navigator?.language?.split('-')[0];
    if (browserLang && supportedLangs.includes(browserLang)) return browserLang;
    return fallbackLang;
}

export function parseICU(templateText: string, params?: Record<string, string | number>): string {
    if (!params) return templateText;

    const paramMap: Translations = {};
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

    function extractOptions(body: string): Translations {
        const options: Translations = {};
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

export function flattenTranslations(obj: any, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(result, flattenTranslations(value, newKey));
        } else {
            result[newKey] = String(value);
        }
    }
    return result;
}


export function toObservable<T>(signal: Signal<T>): Observable<T> {
    return new Observable(subscribe => {
        const stop = effect(() => subscribe.next(signal()));
        return () => stop;
    })
}


export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
    const output = { ...target } as T & U;
    for (const key in source) {
        const targetValue = (target as any)[key];
        if (
            source.hasOwnProperty(key) &&
            typeof source[key] === 'object' &&
            source[key] !== null &&
            !Array.isArray(source[key]) &&
            typeof targetValue === 'object' &&
            targetValue !== null &&
            !Array.isArray(targetValue)
        ) {
            output[key] = deepMerge(targetValue as any, source[key] as any);
        } else {
            output[key] = source[key] as any;
        }
    }
    return output;
}

export function filterNewKeysDeep<T extends object, U extends object>(bundle: T, existing: U): Partial<T> {
    const result = {} as Partial<T>;
    for (const key in bundle) {
        const existValue = (existing as any)[key];
        if (
            typeof bundle[key] === 'object' &&
            bundle[key] !== null &&
            !Array.isArray(bundle[key]) &&
            typeof existValue === 'object' &&
            existValue !== null &&
            !Array.isArray(existValue)
        ) {
            result[key] = filterNewKeysDeep(bundle[key], existValue) as any;
        } else if (!(key in existing)) {
            result[key] = bundle[key];
        }
    }
    return result;
}

export function getNested(obj: any, path: string): string | undefined {
    return path.split('.').reduce((res, key) => res?.[key], obj);
}