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

    readonly onLangChange = toObservable(this.lang);
    private namespace = '';

    get lang(): Signal<string> {
        return computed(() => this.core.lang());
    }

    get currentLang(): string {
        return this.core.currentLang;
    }
    get supportedLangs(): string[] {
        return this.config.supportedLangs;
    }

    get getNskey(): string {
        return `${this.lang()}:${this.namespace}`
    }

    get readySignal(): Signal<boolean> {
        return this.core.readySignal(this.namespace);
    }

    get ready(): boolean {
        return this.core.readySignal(this.namespace)();
    }

    constructor(
        @Inject(TRANSLATION_NAMESPACE) public readonly namespaceInput: string | string[],
    ) {
        const primary = Array.isArray(namespaceInput) ? namespaceInput[0] : namespaceInput as string;
        this.namespace = primary;
        effect(() => {
            const nsKey = this.getNskey;
            if (!this.ready) {
                this.core.load(nsKey, () => this.loader.load(this.config.i18nRoots, this.namespace, this.lang()))
            }
        })
    }

    setLang(lang: string): void {
        this.core.setLang(lang);
    }

    t(key: string, params: Params = {}): string {
        const nsKey = this.getNskey;
        const missingResult = this.getMissingTranslation(key);
        if (!this.ready) return missingResult;
        const formatResult = this.core.getAndCreateFormatter(nsKey, key);
        if (formatResult) return formatResult.format(params);
        const fallback = this.core.findFallbackFormatter(key, []);
        if (fallback) return fallback.format(params);
        return missingResult;
    }

    private getMissingTranslation(key?: string): string | never {
        const forceMode = this.config.missingTranslationBehavior ?? 'show-key';
        switch (forceMode) {
            case 'throw':
                throw new Error(`[i18n] Missing translation: ${key} in ${this.namespace}`);
            case 'empty': return '';
            case 'show-key': return key ?? '';
            default: return forceMode;
        }
    }

    addResourceBundle(...p: Parameters<TranslationCoreService['addResourceBundle']>) {
        return this.core.addResourceBundle(...p);
    }
    addResources(...p: Parameters<TranslationCoreService['addResources']>) {
        return this.core.addResources(...p);
    }
    addResource(...p: Parameters<TranslationCoreService['addResource']>) {
        return this.core.addResource(...p);
    }
    hasResourceBundle(...p: Parameters<TranslationCoreService['hasResourceBundle']>) {
        return this.core.hasResourceBundle(...p);
    }
    getResource(...p: Parameters<TranslationCoreService['getResource']>) {
        return this.core.getResource(...p);
    }
    getResourceBundle(...p: Parameters<TranslationCoreService['getResourceBundle']>) {
        return this.core.getResourceBundle(...p);
    }
    removeResourceBundle(...p: Parameters<TranslationCoreService['removeResourceBundle']>) {
        return this.core.removeResourceBundle(...p);
    }
    preloadNamespaces(...p: Parameters<TranslationCoreService['preloadNamespaces']>) {
        return this.core.preloadNamespaces(...p);
    }
}

