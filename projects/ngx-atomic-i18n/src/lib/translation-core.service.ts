import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { deepMerge, detectPreferredLang, filterNewKeysDeep, getNested, parseICU, toObservable } from './translate.util';

import { FIFOCache } from './FIFO.model';
import { ICU_FORMATTER_TOKEN, TRANSLATION_CONFIG, TRANSLATION_LOADER } from './translate.token';
import { FormatResult, nsKey, Translations } from './translate.type';

const MAX_CACHE_SIZE = 30;
@Injectable({
  providedIn: 'root'
})
export class TranslationCoreService {
  private readonly _config = inject(TRANSLATION_CONFIG);
  private readonly _loader = inject(TRANSLATION_LOADER);
  private readonly _ICU = inject(ICU_FORMATTER_TOKEN, { optional: true }) as unknown as (new (raw: string, lang: string) => FormatResult) | null

  private readonly _lang = signal(detectPreferredLang(this._config));
  readonly lang = this._lang.asReadonly();

  private readonly _jsonCache = signal(new Map<string, Map<string, Record<string, any>>>()); // lang => namespace => key
  private readonly _fifoCache = new FIFOCache<nsKey, FormatResult>(MAX_CACHE_SIZE);
  private _missingKeyCache = new Set<nsKey>();

  readonly onLangChange = toObservable(this._lang);
  readonly fallbackLang = this._config.fallbackLang ?? 'en';

  get currentLang(): string {
    return this._lang.asReadonly()();
  }

  readySignal(namespace: string): Signal<boolean> {
    return computed(() => this.hasJsonCacheValue(this.lang(), namespace));
  }

  setLang(lang?: string): void {
    const currentLang = lang ?? detectPreferredLang(this._config);
    if (!this._config.supportedLangs.includes(currentLang)) {
      console.warn(`[i18n] Unsupported language: ${currentLang}`);
      return;
    }
    if (this._lang() !== currentLang) {
      this._lang.set(currentLang);
      const isBroswer = typeof window !== 'undefined';
      if (isBroswer) {
        try {
          localStorage.setItem('lang', this._lang());
        } catch (err) {
          console.warn('[i18n] Failed to write to localStorage', err);
        }
      }
    }
  }

  async load(nsKey: string, fetchFn: () => Promise<Translations>): Promise<void> {
    const [lang, namespace] = nsKey.split(':');
    if (!!this.hasJsonCacheValue(lang, namespace)) return;
    const json = await fetchFn();
    this.handleNewTranslations(json, lang, namespace);
  }

  getAndCreateFormatter(nsKey: string, key: string): FormatResult | undefined {
    const cacheKey = `${this.lang()}:${key}`;
    if (this._fifoCache.has(cacheKey)) return this._fifoCache.get(cacheKey);
    const [lang, namespace] = nsKey.split(':');
    const raw = getNested(this._jsonCache().get(lang)?.get(namespace), key);
    if (raw === undefined) return;
    const result: FormatResult = this._ICU ? new this._ICU(raw, this.lang()) : {
      format: (p) => parseICU(raw, p)
    }
    this._fifoCache.set(key, result);
    return result;
  }

  findFallbackFormatter(key: string, exclude: string[]): FormatResult | undefined {
    const cacheKey = `${this.currentLang}:${key}`;
    if (this._missingKeyCache.has(cacheKey)) return undefined;
    const namespaces = Array.isArray(this._config.fallbackNamespace)
      ? this._config.fallbackNamespace
      : [this._config.fallbackNamespace ?? '']
    for (const namespace of namespaces) {
      const nsKey = `${this.currentLang}:${namespace}`;
      if (exclude.includes(nsKey)) continue;
      const reslt = this.getAndCreateFormatter(nsKey, key);
      if (reslt) return reslt;
    }
    this._missingKeyCache.add(cacheKey);
    return undefined;
  }

  async preloadNamespaces(namespaces: string[], lang: string): Promise<void> {
    const roots = Array.isArray(this._config.i18nRoots) ? this._config.i18nRoots : [this._config.i18nRoots];
    for (const namespace of namespaces) {
      if (this.hasJsonCacheValue(lang, namespace)) continue;
      const json = await this._loader.load(roots, namespace, lang);
      this.handleNewTranslations(json, lang, namespace);
    }
  }

  private handleNewTranslations(json: Translations, lang: string, namespace: string): void {
    const map = new Map(this._jsonCache());
    const langMap = new Map(this._jsonCache().get(lang));
    langMap.set(namespace, json);
    map.set(lang, langMap);
    this._jsonCache.set(map);
    this._missingKeyCache.clear();
  }

  private hasJsonCacheValue(lang: string, namespace: string): boolean {
    return this._jsonCache().get(lang)?.get(namespace) !== undefined;
  }

  addResourceBundle(lang: string, namespace: string, bundle: Translations, deep = true, overwrite = true) {
    const map = new Map(this._jsonCache());
    const oldLangMap = map.get(lang);
    const langMap = oldLangMap ? new Map(map.get(lang)) : new Map<string, Translations>();
    const existTranslations = langMap.get(namespace) ?? {};
    let merged: Translations;
    if (deep) {
      merged = overwrite
        ? deepMerge(existTranslations, bundle)
        : deepMerge(existTranslations, filterNewKeysDeep(bundle, existTranslations))
    } else {
      merged = overwrite
        ? { ...existTranslations, ...bundle }
        : { ...bundle }
      if (!overwrite) {
        for (const key in existTranslations) {
          if (!(key in merged)) {
            merged[key] = existTranslations[key];
          }
        }
      }
    }
    langMap.set(namespace, merged);
    map.set(lang, langMap);
    this._jsonCache.set(map);
  }

  addResources(lang: string, namespace: string, obj: Translations, overwrite = true) {
    this.addResourceBundle(lang, namespace, obj, false, overwrite);
  }

  addResource(lang: string, namespace: string, key: string, val: string, overwrite = true) {
    this.addResources(lang, namespace, { [key]: val }, overwrite);
  }

  hasResourceBundle(lang: string, namespace: string): boolean {
    return !!this._jsonCache().get(lang)?.has(namespace);
  }

  getResourceBundle(lang: string, namespace: string): Translations | undefined {
    return this._jsonCache().get(lang)?.get(namespace);
  }

  removeResourceBundle(lang: string, namespace: string): void {
    const map = new Map(this._jsonCache());
    const langMap = new Map(map.get(lang));
    langMap.delete(namespace)
    map.set(lang, langMap);
    this._jsonCache.set(map);
    this._fifoCache.delete(`${lang}:${namespace}`)
  }

  getResource(lang: string, namespace: string, key: string): string | undefined {
    return getNested(this._jsonCache().get(lang)?.get(namespace), key);
  }

}
