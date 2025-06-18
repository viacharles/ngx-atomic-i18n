import { computed, inject, Injectable, Signal, signal } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_CONTEXT } from "./translate.token";
import { Params, TranslationContext, Translations } from "./translate.type";
import { detectPreferredLang, parseICU, toObservable } from "./translate.util";
import { HttpClient } from "@angular/common/http";
import { catchError, firstValueFrom, of } from "rxjs";
import { FIFOCache } from "./FIFO.model";

@Injectable({ providedIn: 'root' })
export class TranslationService {
    private readonly config = inject(TRANSLATION_CONFIG);
    private readonly http = inject(HttpClient);
    private readonly context = inject<TranslationContext>(TRANSLATION_CONTEXT, { optional: true });

    private readonly _lang = signal<string>((typeof this.config.initialLang === 'string' ? this.config.initialLang : this.config.initialLang?.()) ?? this.config.fallbackLang);
    private _readyMap = new Map<string, Signal<boolean>>();
    private _readySetter = new Map<string, (isReady: boolean) => void>();

    private _cache = new Map<string, Map<string, string>>(); // ${lang}:${ns} => ${key} => value | signal
    private _computedCache = new Map<string, FIFOCache<string, Signal<string>>>;
    private readonly maxloaded = 30;

    readonly onLangChange = toObservable(this._lang.asReadonly());

    get currentLang(): Signal<string> {
        return this._lang.asReadonly();
    }
    get supportedLangs(): string[] {
        return this.config.supportedLangs;
    }

    getReadySignal(lang: string, ns: string): Signal<boolean> {
        const key = `${lang}:${ns}`;
        if (!this._readyMap.has(key)) {
            const s = signal(false);
            this._readyMap.set(key, s.asReadonly());
            this._readySetter.set(key, s.set.bind(s));
        }
        return this._readyMap.get(key)!;
    }

    getReady(ns: string): Signal<boolean> {
        return this.getReadySignal(this._lang(), ns);
    }

    async ensureLoaded(lang: string, ns?: string): Promise<void> {
        console.log('aa-ensureLoaded', lang, ns)
        if (!ns) return;
        const nsKey = `${lang}:${ns}`;
        const existing = this._cache.get(nsKey);
        if (existing) {
            this._readySetter.get(nsKey)?.(true);
            return;
        }
        const roots = Array.isArray(this.config.i18nRoot)
            ? this.config.i18nRoot
            : [this.config.i18nRoot];
        const map = new Map<string, string>();
        const results = await Promise.all(
            roots.map(root => {
                const path = `assets/${root}/${ns}/${lang}.json`;
                return firstValueFrom(
                    this.http.get<Translations>(path).pipe(
                        catchError(err => {
                            console.warn(`[i18n] Failed to load ${nsKey} from ${path}`, err);
                            return of(null); // 若失敗則跳過
                        })
                    )
                );
            })
        );
        console.log('aa-ensureLoaded result', results)
        for (const res of results) {
            if (res) {
                for (const [k, v] of Object.entries(res)) {
                    map.set(k, v); // 覆蓋策略：後面的會蓋前面的 key
                }
            }
        }
        this._cache.set(nsKey, map);
        console.log('aa-ensureLoaded  this._cache', this._cache)
        this._readySetter.get(nsKey)?.(true);
        console.log('aa-ensureLoaded map', map, '_cache.size', this._cache.size)
        if (this._cache.size > this.maxloaded) {
            const oldest = this._cache.keys().next().value;
            if (oldest) {
                this._cache.delete(oldest);
                console.log('aa-ensureLoaded _cache.delete', this._cache)
                for (const key of this._computedCache.keys()) {
                    if (key.startsWith(oldest)) {
                        this._computedCache.delete(key);
                    }
                }
            }
        }
        console.log(`[i18n] loaded ${nsKey}`);
    }

    translate(key: string, params?: Params): Signal<string> {
        const ctx = inject(TRANSLATION_CONTEXT, { optional: true })
        const lang = this._lang;
        // const ctx = this.context;
        if (key === 'welcome') {
            console.log('aa-translate ctx', ctx)
        }
        return computed(() => {
            const nsKey = `${lang()}:${ctx?.namespace}`;
            const translations = this._cache.get(nsKey);
            if (key === 'welcome') {
                console.log('aa-translate translations', this._cache, nsKey)
            }
            const raw = translations?.get(key) ?? key;
            if (key === 'welcome') {
                console.log('aa-translate raw', raw)
            }
            if (!params) return raw;
            const resolvedParams = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, typeof v === 'function' ? v() : v]))
            const paramKey = `${key}:${JSON.stringify(params)}`;
            let fifo = this._computedCache.get(nsKey);
            if (!fifo) {
                fifo = new FIFOCache(this.maxloaded);
                this._computedCache.set(nsKey, fifo);
            }
            if (fifo.has(paramKey)) {
                return fifo.get(paramKey)!();
            }
            const computedSignal = computed(() =>
                parseICU(raw, resolvedParams)
            )
            fifo.set(paramKey, computedSignal);
            return computedSignal();
        })
    }

    async setLang(lang: string): Promise<void> {
        const currentLang = lang ?? detectPreferredLang(this.config);
        if (!this.config.supportedLangs.includes(currentLang)) {
            console.warn(`[i18n] Unsupported language: ${currentLang}`);
            return;
        }
        if (this._lang() !== currentLang) {
            this._lang.set(currentLang);
            console.log('aa-setLang', this._lang())
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

}

