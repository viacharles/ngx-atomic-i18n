import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { deepMerge, detectPreferredLang, filterNewKeysDeep, getNested, normalizeLangCode, parseICU, toObservable } from './translate.util';

import { FIFOCache } from './FIFO.model';
import { ICU_FORMATTER_TOKEN, TRANSLATION_CONFIG, TRANSLATION_LOADER } from './translate.token';
import { FormatResult, nsKey, Translations } from './translate.type';

/** Maximum compiled formatter entries retained before evicting older ones. */
const MAX_CACHE_SIZE = 30;
@Injectable({
  providedIn: 'root'
})
/**
 * Central cache and orchestration layer for loading translation namespaces,
 * compiling ICU messages, and serving formatted strings to the higher-level API.
 */
export class TranslationCoreService {
  /** Immutable runtime configuration injected from the library bootstrap. */
  private readonly _config = inject(TRANSLATION_CONFIG);
  /** Active loader used to fetch namespace JSON payloads. */
  private readonly _loader = inject(TRANSLATION_LOADER);
  /** Optional custom ICU formatter constructor supplied by the host application. */
  private readonly _ICU = inject(ICU_FORMATTER_TOKEN, { optional: true }) as unknown as (new (raw: string, lang: string) => FormatResult) | null
  private readonly debugEnabled = !!this._config.debug;

  /** Reactive language state tracking the current locale. */
  private readonly _lang = signal(detectPreferredLang(this._config));
  readonly lang = this._lang.asReadonly();

  /** Translation documents keyed by language then namespace. */
  private readonly _jsonCache = signal(new Map<string, Map<string, Record<string, any>>>()); // lang => namespace => key
  /** Version fingerprints captured alongside each namespace entry. */
  private readonly _versionMap = signal(new Map<string, Map<string, string | undefined>>()); // lang => namespace => version
  /** Least-recently-used cache of compiled ICU formatters. */
  private readonly _formatterCache = new FIFOCache<nsKey, FormatResult>(MAX_CACHE_SIZE);
  private _missingKeyCache = new Set<nsKey>();
  private _inflight = new Map<string, Promise<void>>();
  /** Caches compiled ICU expressions (with or without custom formatters). */
  private readonly _icuCompiledCache = new Map<string, FormatResult>();

  readonly onLangChange = toObservable(this._lang);
  readonly fallbackLang = this._config.fallbackLang ?? 'en';

  get currentLang(): string {
    return this._lang.asReadonly()();
  }

  readySignal(namespace: string, version?: string): Signal<boolean> {
    return computed(() => this.hasJsonCacheValue(this.lang(), namespace, version));
  }

  setLang(lang?: string): void {
    const attempted = lang ?? detectPreferredLang(this._config);
    const currentLang = normalizeLangCode(attempted, this._config.supportedLangs);

    if (!currentLang) {
      this.warn(`Unsupported language requested: ${attempted}`);
      return;
    }
    if (this._lang() !== currentLang) {
      this._lang.set(currentLang);
      this.log(`Switched active language to "${currentLang}".`);
      this._icuCompiledCache.clear();
      const isBroswer = typeof window !== 'undefined';
      if (isBroswer) {
        try {
          localStorage.setItem('lang', this._lang());
        } catch (err) {
          this.warn('Failed to persist language to localStorage.', err);
        }
      }
    }
  }

  async load(nsKey: string, fetchFn: () => Promise<Translations>): Promise<void> {
    const parts = nsKey.split(':');
    const lang = parts[0];
    const namespace = parts[1];
    const version = parts[2];
    if (this.hasJsonCacheValue(lang, namespace, version)) {
      this.log(`Namespace "${namespace}" for "${lang}" is already cached. Skip loader.`);
      return;
    }

    // coalesce concurrent loads for the same nsKey
    if (this._inflight.has(nsKey)) {
      this.log(`Namespace "${namespace}" for "${lang}" is already loading. Reusing in-flight request.`);
      await this._inflight.get(nsKey);
      return;
    }

    this.log(`Loading namespace "${namespace}" for "${lang}"${version ? ` (version ${version})` : ''}.`);
    const p = (async () => {
      try {
        const json = await fetchFn();
        this.handleNewTranslations(json, lang, namespace, version);
        this.log(`Namespace "${namespace}" for "${lang}" loaded successfully.`);
      } catch (error) {
        this.error(`Failed to load namespace "${namespace}" for "${lang}".`, error);
        throw error;
      } finally {
        this._inflight.delete(nsKey);
      }
    })();
    this._inflight.set(nsKey, p);
    await p;
  }

  getAndCreateFormatter(nsKey: string, key: string): FormatResult | undefined {
    const cacheKey = `${nsKey}:${key}`;
    if (this._formatterCache.has(cacheKey)) return this._formatterCache.get(cacheKey);
    const [lang, namespace] = nsKey.split(':');
    const raw = getNested(this._jsonCache().get(lang)?.get(namespace), key);
    if (key === 'getStart.config.supportedLangHint') {
      console.log('aa-raw', raw, lang, namespace, this._jsonCache().get(lang)?.get(namespace))
    }

    if (raw === undefined) return;
    let result: FormatResult;
    if (this._ICU) {
      const k = `${raw}|${this.lang()}`;
      const exist = this._icuCompiledCache.get(k);
      if (exist) {
        result = exist;
      } else {
        result = new this._ICU(raw, this.lang());
        this._icuCompiledCache.set(k, result);
      }
    } else {
      const k = raw;
      const exist = this._icuCompiledCache.get(k);
      if (exist) {
        result = exist;
      } else {
        result = { format: (p) => parseICU(raw, p) };
        this._icuCompiledCache.set(k, result);
      }
    }
    this._formatterCache.set(cacheKey, result);
    return result;
  }

  findFallbackFormatter(key: string, exclude: string[], version?: string): FormatResult | undefined {
    const namespaces = Array.isArray(this._config.fallbackNamespace)
      ? this._config.fallbackNamespace
      : [this._config.fallbackNamespace ?? '']
    for (const namespace of namespaces) {
      const nsKey = version ? `${this.currentLang}:${namespace}:${version}` : `${this.currentLang}:${namespace}`;
      if (exclude.includes(nsKey)) continue;
      const missKey = version
        ? `${this.currentLang}:${namespace}:${version}:${key}`
        : `${this.currentLang}:${namespace}:${key}`;
      if (this._missingKeyCache.has(missKey)) continue;
      const result = this.getAndCreateFormatter(nsKey, key);
      if (result) return result;
      this._missingKeyCache.add(missKey);
    }
    return undefined;
  }

  async preloadNamespaces(namespaces: string[], lang: string): Promise<void> {
    const roots = Array.isArray(this._config.i18nRoots) ? this._config.i18nRoots : [this._config.i18nRoots];
    const loadList = namespaces.filter(namespace => !this.hasJsonCacheValue(lang, namespace));
    const jsonArray = await Promise.all(loadList.map(namespace => this._loader.load(roots, namespace, lang)));
    jsonArray.forEach((json, index) => this.handleNewTranslations(json, lang, loadList[index], undefined))
  }

  private handleNewTranslations(json: Translations, lang: string, namespace: string, version?: string): void {
    const map = new Map(this._jsonCache());
    const langMap = new Map(this._jsonCache().get(lang));
    langMap.set(namespace, json);
    map.set(lang, langMap);
    this._jsonCache.set(map);

    const vMap = new Map(this._versionMap());
    const vLangMap = new Map(this._versionMap().get(lang));
    vLangMap.set(namespace, version);
    vMap.set(lang, vLangMap);
    this._versionMap.set(vMap);

    // Invalidate formatter cache for this namespace (covers with/without version)
    const nsKey = `${lang}:${namespace}:`;
    this._formatterCache.deleteWhere((k) => (k as unknown as string).startsWith(nsKey));

    this._missingKeyCache.clear();
    if (this.debugEnabled) {
      const keyCount = json && typeof json === 'object' ? Object.keys(json).length : 0;
      this.log(`Cached namespace "${namespace}" for "${lang}" (${keyCount} top-level keys).`);
    }
  }

  private hasJsonCacheValue(lang: string, namespace: string, version?: string): boolean {
    const exists = this._jsonCache().get(lang)?.get(namespace) !== undefined;
    if (!exists) return false;
    if (version !== undefined) {
      const stored = this._versionMap().get(lang)?.get(namespace);
      return stored === version;
    }
    return true;
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

  getAllBundle(): Map<string, Map<string, Record<string, any>>> {
    return this._jsonCache()
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
    // Evict all formatter cache entries that belong to this lang:namespace (with or without version)
    // Keys are in form `${nsKey}:${key}` where nsKey may include version
    const prefix = `${lang}:${namespace}:`;
    this._formatterCache.deleteWhere((k) => (k as unknown as string).startsWith(prefix));
    // also clear missing-key entries for this namespace
    for (const k of Array.from(this._missingKeyCache)) {
      if (k.startsWith(prefix)) this._missingKeyCache.delete(k);
    }
  }

  /** Clear everything: data, versions, formatters, missing keys, inflight */
  clearAll(): void {
    this._jsonCache.set(new Map());
    this._versionMap.set(new Map());
    this._formatterCache.clear();
    this._missingKeyCache.clear();
    this._inflight.clear();
    this._icuCompiledCache.clear();
  }

  /** Clear all resources for a language */
  clearLang(lang: string): void {
    const map = new Map(this._jsonCache());
    map.delete(lang);
    this._jsonCache.set(map);
    const vmap = new Map(this._versionMap());
    vmap.delete(lang);
    this._versionMap.set(vmap);
    this._formatterCache.deleteWhere((k) => (k as unknown as string).startsWith(`${lang}:`));
    for (const k of Array.from(this._missingKeyCache)) {
      if (k.startsWith(`${lang}:`)) this._missingKeyCache.delete(k);
    }
    for (const k of Array.from(this._icuCompiledCache.keys())) {
      if (k.endsWith(`|${lang}`)) this._icuCompiledCache.delete(k);
    }
  }

  /** Clear a specific namespace for a language */
  clearNamespace(lang: string, namespace: string): void {
    this.removeResourceBundle(lang, namespace);
  }

  getResource(lang: string, namespace: string, key: string): string | undefined {
    return getNested(this._jsonCache().get(lang)?.get(namespace), key);
  }

  private log(message: string, ...details: unknown[]): void {
    if (!this.debugEnabled) return;
    if (details.length) {
      console.info(`[ngx-i18n] ${message}`, ...details);
    } else {
      console.info(`[ngx-i18n] ${message}`);
    }
  }

  private error(message: string, error: unknown): void {
    if (!this.debugEnabled) return;
    console.error(`[ngx-i18n] ${message}`, error);
  }

  private warn(message: string, ...details: unknown[]): void {
    if (!this.debugEnabled) return;
    if (details.length) {
      console.warn(`[ngx-i18n] ${message}`, ...details);
    } else {
      console.warn(`[ngx-i18n] ${message}`);
    }
  }
}
