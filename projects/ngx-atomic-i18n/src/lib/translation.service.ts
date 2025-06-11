import { computed, inject, Injectable, Signal, signal } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_CONTEXT } from "./translate.token";
import { Params, TranslationContext } from "./translate.type";
import { detectPreferredLang } from "./translate.util";

@Injectable({ providedIn: 'root' })
export class TranslationService {
    private readonly config = inject(TRANSLATION_CONFIG);
    private readonly context = inject<TranslationContext>(TRANSLATION_CONTEXT, { optional: true });

    private readonly _lang = signal<string>((typeof this.config.initialLang === 'string' ? this.config.initialLang : this.config.initialLang?.()) ?? this.config.fallbackLang);
    private _translatCache = new Map<string, Map<string, Signal<string>>>(); // ${lang}:${ns} => ${ns}:${key} => 
    private _loadedOrder: string[] = []; // `${lang}:${ns}`
    private _currentContext = signal<TranslationContext | null>(null);
    private readonly maxloadedCache = 30;

    get currentLang(): Signal<string> {
        return this._lang;
    }
    get supportedLangs(): string[] {
        return this.config.supportedLangs;
    }
    get fallbackLang(): string {
        return this.config.fallbackLang;
    }
    get initialLang(): string {
        return this.config.initialLang?.() ?? this.fallbackLang;
    }

    setContext(ctx: TranslationContext): void {
        this._currentContext.set(ctx);
    }

    translate(key: string, params?: Params): Signal<string> {
        const lang = this._lang();
        if (key === 'welcome') {
            console.log('aa-', lang)
        }
        const ctx = this.context;
        const nsKey = ctx?.namespace ? `${ctx?.namespace}:${key}` : key;
        const paramKey = `${nsKey}: ${JSON.stringify(params ?? {})}`
        const groupKey = `${lang}:${nsKey}`;
        const groupMap = this._translatCache.get(groupKey) ?? new Map<string, Signal<string>>();
        if (!this._translatCache.has(groupKey)) {
            this._translatCache.set(groupKey, groupMap);
            if (key === 'welcome') {
                console.log('aa-set', key, groupKey, groupMap)
            }
        }
        if (!params) {
            if (groupMap.has(nsKey)) {
                if (key === 'welcome') {
                    console.log('aa-groupMap.get(nsKey)!()', key, groupMap.get(nsKey)!())
                }
                return groupMap.get(nsKey)!;
            }
            const rawSignal = computed(() => {
                const nsMap = this._translatCache.get(`${this._lang()}:${ctx?.namespace ?? 'common'}`);
                if (key === 'welcome') {
                    console.log('aa-rawSignal', key, nsMap)
                }
                return nsMap?.get(nsKey)?.() ?? key;
            })
            groupMap.set(nsKey, rawSignal);
            return rawSignal;
        }
        if (groupMap.has(paramKey)) {
            if (key === 'welcome') {
                console.log('aa-groupMap.get(paramKey)!();', key, groupMap.get(paramKey)!())
            }
            return groupMap.get(paramKey)!;
        }
        const paramSignal = computed(() => {
            const nsMap = this._translatCache.get(`${this._lang()}:${ctx?.namespace ?? 'common'}`);
            const raw = nsMap?.get(nsKey)?.() ?? key;
            if (key === 'welcome') {
                console.log('aa-paramSignal', key, nsMap)
            }
            return this.parseICU(raw, params);
        })
        groupMap.set(paramKey, paramSignal);
        return paramSignal;
    }

    async setLang(lang: string): Promise<void> {
        console.log('>> setLang called with context:', this.context);
        const currentLang = lang ?? detectPreferredLang(this.config)
        if (!this.config.supportedLangs.includes(currentLang)) {
            console.warn(`[i18n] Unsupported language: ${currentLang}`);
            return;
        }
        const isBroswer = typeof window !== 'undefined';
        if (isBroswer) {
            try {
                localStorage.setItem('lang', currentLang);
            } catch (err) {
                console.warn('[i18n] Failed to write to localStorage', err);
            }
        }
        this._lang.set(currentLang);
        console.log('aa-setLang config', lang, this.config);

        const ctx = this.context;
        const lazyLoader = ctx?.lazyLoader;
        const ns = ctx?.namespace;
        console.log('aa-setLang lazyLoader', lazyLoader)
        if (!ns) return;
        const nsKey = `${currentLang}:${ns}`;
        const cached = this._translatCache.get(nsKey)
        if (cached) return;
        if (this._loadedOrder.length >= this.maxloadedCache) {
            const oldestNsKey = this._loadedOrder.shift();
            if (oldestNsKey) {
                this._translatCache.delete(oldestNsKey);
            }
        }
        try {
            let data = await lazyLoader?.[currentLang]?.();
            if (!data && currentLang !== this.fallbackLang) {
                data = await lazyLoader?.[this.fallbackLang]?.();
            }
            if (!data) {
                console.warn(`[i18n] Still failed to load translations for ${nsKey}`);
                return;
            }
            const map = new Map<string, Signal<string>>();
            for (const [key, val] of Object.entries(data)) {
                map.set(key, signal(val));
            }
            this._translatCache.set(nsKey, map);
            this._loadedOrder.push(nsKey);
        } catch (err) {
            console.warn(`[i18n] Failed to load ${nsKey}`, err);
        }
    }

    private parseICU(templateText: string, params: Params): string {
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

}

