import { computed, Inject, inject, Injectable, Optional, Signal, signal, WritableSignal } from '@angular/core';
import { detectPreferredLang, parseICU, toObservable, flattenTranslations } from './translate.util';
import { FormatResult, ICU_FORMATTER_TOKEN, STATIC_I18N_LANG, TRANSLATION_CONFIG, TRANSLATION_LOADER, TranslationConfig, Translations } from 'ngx-atomic-i18n';
import { FIFOCache } from './FIFO.model';

const MAX_CACHE_SIZE = 30;
@Injectable({
  providedIn: 'root'
})
export class TranslationCoreService {
  private readonly _config = inject(TRANSLATION_CONFIG);
  private readonly _loader = inject(TRANSLATION_LOADER);
  private readonly _ICUModel = inject(ICU_FORMATTER_TOKEN, { optional: true }) as unknown as (new (raw: string, lang: string) => FormatResult) | null

  private readonly _lang = signal(detectPreferredLang(this._config));
  readonly lang = this._lang.asReadonly();

  private readonly _jsonCache = signal(new Map<string, Map<string, string>>());
  private readonly _fifoCache = new Map<string, FIFOCache<string, FormatResult>>();

  readonly onLangChange = toObservable(this._lang);
  readonly fallbackLang = this._config.fallbackLang ?? 'en';

  get currentLang(): Signal<string> {
    return this._lang;
  }

  constructor(
    @Inject(TRANSLATION_CONFIG) private readonly config: TranslationConfig,
    @Optional() @Inject(STATIC_I18N_LANG) private staticLang?: string,
  ) { }

  readySignal(nsKey: string): Signal<boolean> {
    return computed(() => this.hasValue(this._jsonCache, nsKey));
  }

  setLang(lang?: string): void {
    const currentLang = lang ?? detectPreferredLang(this.config, this.staticLang);
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
    if (this.hasValue(this._jsonCache, nsKey)) return;
    const json = await fetchFn();
    // 扁平化嵌套對象
    const flattenedJson = flattenTranslations(json);
    const newMap = new Map(this._jsonCache());
    newMap.set(nsKey, new Map(Object.entries(flattenedJson)));
    this._jsonCache.set(newMap);
    this._fifoCache.delete(nsKey);
  }

  getFormatter(nsKey: string, key: string): FormatResult | undefined {
    let fifo = this._fifoCache.get(nsKey);
    if (!fifo) {
      fifo = new FIFOCache(MAX_CACHE_SIZE);
      this._fifoCache.set(nsKey, fifo);
    };
    if (fifo.has(key)) return fifo.get(key);
    const raw = this._jsonCache().get(nsKey)?.get(key);
    if (raw === undefined) return;
    const format: FormatResult = this._ICUModel ? new this._ICUModel(raw, this.lang()) : {
      format: (p) => parseICU(raw, p)
    }
    fifo.set(key, format);
    return format;
  }

  hasValue(cache: WritableSignal<Map<string, any>>, nsKey: string): boolean {
    return !!cache().get(nsKey)?.size;
  }

  async preloadNamespaces(namespaces: string[], lang: string): Promise<void> {
    const roots = Array.isArray(this.config.i18nRoots) ? this.config.i18nRoots : [this.config.i18nRoots];
    console.log('aa-roots', roots)
    for (const ns of namespaces) {
      const nsKey = `${lang}:${ns}`;
      if (this.hasValue(this._jsonCache, nsKey)) continue;
      const json = await this._loader.load(roots, ns, lang);
      // 扁平化嵌套對象
      const flattenedJson = flattenTranslations(json);
      const newMap = new Map(this._jsonCache());
      newMap.set(nsKey, new Map(Object.entries(flattenedJson)));
      this._jsonCache.set(newMap);
      this._fifoCache.delete(nsKey);
    }
  }
}
