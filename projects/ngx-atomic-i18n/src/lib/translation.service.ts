import { computed, effect, Inject, inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_NAMESPACE } from "./translate.token";
import { Params, Translations } from "./translate.type";
import { parseICU, toObservable } from "./translate.util";
import { HttpClient } from "@angular/common/http";
import { catchError, firstValueFrom, of } from "rxjs";
import { FIFOCache } from "./FIFO.model";
import { TranslationCoreService } from "./translation-core.service";

const MAX_CACHE_SIZE = 30;
@Injectable()
export class TranslationService {
    private readonly config = inject(TRANSLATION_CONFIG);
    private _readyMap = new Map<string, WritableSignal<boolean>>();
    private _cacheMap = new Map<string, Map<string, string>>(); // ${lang}:${ns} => ${key} => value | signal
    private _computedCache = new Map<string, FIFOCache<string, Signal<string>>>;
    readonly onLangChange = toObservable(this.currentLang);

    get currentLang(): Signal<string> {
        return computed(() => this.core.currentLang());
    }
    get supportedLangs(): string[] {
        return this.config.supportedLangs;
    }
    get getCache(): Signal<Map<string, string>> | undefined {
        const nsKey = this.getNskey;
        const cache = this._cacheMap.get(nsKey);
        return cache ? signal(cache) : undefined;
    }

    get getNskey(): string {
        return `${this.currentLang()}:${this.namespace}`
    }

    constructor(
        @Inject(TRANSLATION_NAMESPACE) public readonly namespace: string,
        private readonly core: TranslationCoreService,
        private readonly http: HttpClient
    ) {
        effect(() => {
            this.core.lang();
            this.ensureLoaded();
        })
    }

    instant(key: string, params?: Params): string {
        const result = this.translateSignal(key, params)();

        // 添加調試日誌
        if (key === 'test.items' || key === 'test.custom_message') {
            console.log(`🔍 [TranslationService] instant called - key: ${key}, params:`, params);
            console.log(`🔍 [TranslationService] result: ${result}`);
            console.log(`🔍 [TranslationService] current lang: ${this.currentLang()}`);
            console.log(`🔍 [TranslationService] namespace: ${this.namespace}`);
            console.log(`🔍 [TranslationService] cache:`, this._cacheMap);
        }

        return result;
    }

    ready(): boolean {
        return this.readySignal()();
    }

    readySignal(): Signal<boolean> {
        const key = this.getNskey;
        if (!this._readyMap.has(key)) {
            this._readyMap.set(key, signal(false));
        }
        console.log('aa-readySignal', key, this._readyMap.get(key)!())
        return this._readyMap.get(key)!;
    }

    setLang(lang: string): void {
        this.core.setLang(lang);
    }

    // private static async preloadNamespaces(
    //     namespaces: string[],
    //     lang: string,
    // ): Promise<void> {
    //     const i18nRoot = this.core.config.i18nRoot
    //     for (const ns of namespaces) {
    //         const path = `assets/${i18nRoot}/${lang}/${ns}.json`
    //     }
    // }

    async ensureLoaded(): Promise<void> {
        console.log('aa-ensureLoaded -', this.currentLang(), this.namespace)
        if (!this.namespace) return;
        const nsKey = this.getNskey;
        if (this._cacheMap.has(nsKey)) {
            console.log(`🔍 [TranslationService] Cache already exists for ${nsKey}`);
            return;
        }
        const roots = Array.isArray(this.config.i18nRoot)
            ? this.config.i18nRoot
            : [this.config.i18nRoot];
        const map = new Map<string, string>();
        const results = await Promise.all(
            roots.map(root => {
                const path = `assets/${root}/${this.namespace}/${this.currentLang()}.json`;
                console.log(`🔍 [TranslationService] Loading from path: ${path}`);
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
                console.log(`🔍 [TranslationService] Loaded translations:`, res);
                const flattened = this.flatten(res);
                for (const [k, v] of Object.entries(flattened)) {
                    map.set(k, v); // 覆蓋策略：後面的會蓋前面的 key
                }
            }
        }
        this._cacheMap.set(nsKey, map);
        if (!this._readyMap.has(nsKey)) {
            this._readyMap.set(nsKey, signal(true));
        } else {
            this._readyMap.get(nsKey)?.set(true);
        }
        console.log('aa-ensureLoaded  this._cacheMap', this._cacheMap)
        console.log('aa-ensureLoaded map', map, '_cacheMap.size', this._cacheMap.size)
        if (this._cacheMap.size > MAX_CACHE_SIZE) {
            const oldest = this._cacheMap.keys().next().value;
            if (oldest) {
                this._cacheMap.delete(oldest);
                console.log('aa-ensureLoaded _cacheMap.delete', this._cacheMap)
                for (const key of this._computedCache.keys()) {
                    if (key.startsWith(oldest)) {
                        this._computedCache.delete(key);
                    }
                }
            }
        }
        console.log(`[i18n] loaded ${nsKey}`);
    }

    private flatten(obj: any, path: string[] = []): Record<string, string> {
        return Object.keys(obj).reduce((acc, key) => {
            const newPath = path.length > 0 ? `${path.join('.')}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(acc, this.flatten(obj[key], newPath.split('.')));
            } else {
                acc[newPath] = obj[key];
            }
            return acc;
        }, {} as Record<string, string>);
    }
    id = 0;

    translateSignal(key: string, params?: Params): Signal<string> {
        ++this.id;
        return computed(() => {
            const nsKey = `${this.currentLang()}:${this.namespace}`;
            const translations = this._cacheMap.get(nsKey);
            if (nsKey === 'zh-Hant:setting' && params) {
                console.log(`aa-[${this.id}]translate translations`, this._cacheMap, translations, translations?.get(key), key, nsKey)
            }
            let raw = translations?.get(key);
            if (raw === undefined || raw === null) {
                const behovior = this.config.missingTranslationBehavior ?? 'show-key';
                switch (behovior) {
                    case 'throw': throw new Error(`[i18n] Missing translation for key: "${key}" in namespace "${this.namespace}"`);
                    case 'empty': raw = ''; break;
                    case 'show-key':
                    default: raw = `[MISSING:${key}]`;
                }
            };
            if (nsKey === 'zh-Hant:setting' && params) {
                console.log(`aa-[${this.id}] translate raw`, raw)
            }
            if (!params) return raw;
            const paramsObject = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, typeof v === 'function' ? v() : v]))
            const paramKey = `${key}:${JSON.stringify(params)}`;
            if (nsKey === 'zh-Hant:setting' && params) {
                console.log(`aa-[${this.id}] translate paramKey`, paramKey, paramsObject)
            }
            let fifo = this._computedCache.get(nsKey);
            if (nsKey === 'zh-Hant:setting' && params) {
                console.log(`aa-[${this.id}]ranslate fifo`, fifo);
            }
            if (!fifo) {
                fifo = new FIFOCache(MAX_CACHE_SIZE);
                this._computedCache.set(nsKey, fifo);
            }
            if (fifo.has(paramKey)) {
                if (nsKey === 'zh-Hant:setting' && params) {
                    console.log(`aa-[${this.id}] translate fifo(paramKey)`, fifo.get(paramKey)!());
                }
                return fifo.get(paramKey)!();
            }
            // const isICU = typeof raw === 'string' && /{\s*\w+\s*,\s*(plural|select)\s*,/.test(raw);
            // if (!isICU) return raw;
            if (typeof raw !== 'string') return String(raw);
            const computedSignal = computed(() =>
                parseICU(raw, paramsObject)
            )
            fifo.set(paramKey, computedSignal);
            if (nsKey === 'zh-Hant:setting' && params) {
                console.log(`aa-[${this.id}]translate computedSignal`, computedSignal())
            }
            return computedSignal();
        })
    }

}

