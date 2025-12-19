import { effect, inject, Injector, runInInjectionContext, Signal } from "@angular/core";
import { DeepPartial, PathTemplate, TranslationConfig } from "./translate.type";
import { Observable } from "rxjs";

/** Normalizes a language code against the configured supported languages. */
export function normalizeLangCode(
  lang: string | null | undefined,
  supportedLangs: string[]
): string | null {
  if (!lang) return null;
  const variants = new Set<string>();
  variants.add(lang);
  variants.add(lang.replace(/_/g, '-'));
  variants.add(lang.replace(/-/g, '_'));
  variants.add(lang.toLowerCase());
  variants.add(lang.replace(/_/g, '-').toLowerCase());
  for (const candidate of variants) {
    const match = supportedLangs.find(
      supported => supported.toLowerCase() === candidate.toLowerCase()
    );
    if (match) return match;
  }
  return null;
}

/** Determines the most appropriate language using the configured detection order. */
export function detectPreferredLang(config: TranslationConfig): string {
  const { supportedLangs, fallbackLang, langDetectionOrder } = config;
  for (const source of langDetectionOrder) {
    let lang: string | null;
    switch (source) {
      case 'url':
        lang = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : null;
        console.log('aa-url', lang)
        break;
      case 'clientRequest':
        lang = config.clientRequestLang ?? null;
        break;
      case 'localStorage':
        lang = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
        break;
      case 'browser':
        const langTag = (globalThis as any)?.navigator?.language ?? '';
        lang = supportedLangs.find(s => langTag.startsWith(s)) ?? null;
        break;
      case 'customLang':
        lang = typeof config.customLang === 'function' ? config.customLang() : config.customLang ?? null;
        break;
      case 'fallback':
        lang = fallbackLang;
        break;
    }
    const normalized = normalizeLangCode(lang, supportedLangs);
    if (normalized) {
      return normalized;
    };
  }
  return normalizeLangCode(fallbackLang, supportedLangs) ?? fallbackLang;
}

/** Lightweight ICU parser that supports nested select/plural structures. */
export function parseICU(templateText: string, params?: Record<string, string | number>): string {
  if (typeof params === 'object' ? !Object.keys(params).length : true) return templateText;

  const paramMap: Record<string, string> = {};
  for (const [key, val] of Object.entries(params!)) {
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
    return [text.slice(startIndex), text.length];
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
      while (i < body.length && body[i] === ' ') i++;
      if (body[i] !== '{') {
        // Option must have a nested block; otherwise skip it.
        i++;
        continue;
      }
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

      if (!block || block === '' || block === '{}') {
        cursor = nextIndex;
        continue;
      }

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

      if (!selected) {
        result += block;
        cursor = nextIndex;
        continue;
      }

      let resolved = resolveICU(selected);

      if (type === 'plural') {
        resolved = resolved.replace(/#/g, rawVal);
      }

      resolved = resolved.replace(/{{(\w+)}}|\{(\w+)\}/g, (_, k1, k2) => {
        const k = k1 || k2;
        return paramMap[k] ?? '';
      });

      result += resolved;
      cursor = nextIndex;
    }

    return result;
  }

  return resolveICU(templateText);
}



/** Flattens a nested translation object using dot notation keys. */
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


/** Converts a signal to an observable while preserving injection context. */
export function toObservable<T>(signal: Signal<T>): Observable<T> {
  const injector = inject(Injector);
  return new Observable(subscribe => {
    subscribe.next(signal());
    const stop = runInInjectionContext(injector, () => effect(() => subscribe.next(signal()), { allowSignalWrites: true }));
    return () => stop.destroy();
  });
}


/** Deeply merges plain objects, replacing non-object values by assignment. */
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

/** Recursively retains only keys that are not already present in the existing object. */
export function filterNewKeysDeep<T extends object, U extends object>(bundle: T, existing: U): DeepPartial<T> {
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

/** Safely reads a dotted path from a nested object. */
export function getNested(obj: any, path: string): string | undefined {
  return path.split('.').reduce((res, key) => res?.[key], obj);
}

/** Removes any leading slashes from path-like strings. */
export const stripLeadingSep = (s: string) => s.replace(/^[\\/]+/, '');

/** Normalises the path template configuration to an array form. */
export const tempToArray = (template: PathTemplate) => Array.isArray(template) ? template : (template ? [template] : undefined);

/**
 * Detect current build version from injected script names (CSR only).
 * Matches filenames like: main.<hash>.js, runtime.<hash>.js, polyfills.<hash>.js
 */
export function detectBuildVersion(): string | null {
  try {
    if (typeof document === 'undefined' || !document?.scripts) return null;
    const regex = /\/(?:main|runtime|polyfills)\.([a-f0-9]{8,})\.[^\/]*\.js(?:\?|$)/i;
    for (const s of Array.from(document.scripts)) {
      const version = regex.exec((s as HTMLScriptElement).src);
      if (version?.[1]) return version[1];
    }
    return null;
  } catch {
    return null;
  }
}
