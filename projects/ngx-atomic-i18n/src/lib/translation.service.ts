import { computed, effect, Inject, inject, Injectable, Signal } from "@angular/core";
import { TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE } from "./translate.token";
import { Params } from "./translate.type";
import { toObservable } from "./translate.util";
import { TranslationCoreService } from "./translation-core.service";

@Injectable()
export class TranslationService {
    private readonly config = inject(TRANSLATION_CONFIG);
    private readonly core = inject(TranslationCoreService);
    private readonly loader = inject(TRANSLATION_LOADER);

    readonly onLangChange = toObservable(this.currentLang);

    get currentLang(): Signal<string> {
        return computed(() => this.core.currentLang());
    }
    get supportedLangs(): string[] {
        return this.config.supportedLangs;
    }

    get getNskey(): string {
        return `${this.currentLang()}:${this.namespace}`
    }

    get ready(): Signal<boolean> {
        const nsKey = this.getNskey;
        return this.core.readySignal(nsKey);
    }

    constructor(
        @Inject(TRANSLATION_NAMESPACE) public readonly namespace: string,
    ) {
        effect(() => {
            const nsKey = this.getNskey;
            if (!this.core.readySignal(nsKey)()) {
                console.log('aa-service efffect', this.config)
                this.core.load(nsKey, () => this.loader.load(this.config.i18nRoots, this.namespace, this.currentLang()))
            }
        })
    }

    setLang(lang: string): void {
        this.core.setLang(lang);
    }

    t(key: string, params: Params = {}): string {
        const nsKey = this.getNskey;
        if (!this.core.readySignal(nsKey)()) return '';
        const formatResult = this.core.getFormatter(nsKey, key);
        if (formatResult) return formatResult.format(params);
        return this.getMissingTranslation(key);
    }

    private getMissingTranslation(key?: string): string | never {
        const mode = this.config.missingTranslationBehavior ?? 'show-key';
        switch (mode) {
            case 'throw':
                throw new Error(`[i18n] Missing translation: ${key} in ${this.namespace}`);
            case 'empty': return '';
            case 'show-key':
            default: return key ?? `[MISSING:${String(key)}]`;
        }
    }
}

