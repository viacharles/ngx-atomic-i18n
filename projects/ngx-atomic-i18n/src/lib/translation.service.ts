import { computed, effect, Inject, inject, Injectable, Signal } from "@angular/core";
import { BUILD_VERSION, PAGE_TRANSLATION_ROOT, TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE } from "./translate.token";
import { Params } from "./translate.type";
import { detectBuildVersion, toObservable } from "./translate.util";
import { TranslationCoreService } from "./translation-core.service";

@Injectable()
export class TranslationService {
  /** Shared translation configuration resolved from the host application. */
  private readonly config = inject(TRANSLATION_CONFIG);
  private readonly parent = inject(TranslationService, { skipSelf: true, optional: true });
  private readonly isPageRoot = inject(PAGE_TRANSLATION_ROOT, { self: true, optional: true }) ?? false;
  /** Core translation engine that handles lookups and formatter lifecycle. */
  private readonly core = inject(TranslationCoreService);
  /** Loader implementation responsible for fetching translation payloads. */
  private readonly loader = inject(TRANSLATION_LOADER);
  /** Optional build fingerprint for cache busting injected at runtime. */
  private readonly injectedVersion = inject(BUILD_VERSION, { optional: true }) as string | null | undefined;
  /** Flag used to guard debug logging output. */
  private readonly debugEnabled = !!this.config.debug;

  /** Observable mirror of the language signal for consumers outside of signals. */
  readonly onLangChange = toObservable(this.lang);
  /** Namespace currently owned by this service instance. */
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

  /** Build version identifier used to scope namespace caches. */
  private readonly buildVersion: string | null = this.injectedVersion ?? detectBuildVersion();

  /** Composes the unique key used to store namespace resources per lang and build. */
  get getNskey(): string {
    const version = this.buildVersion;
    return version ? `${this.lang()}:${this.namespace}:${version}` : `${this.lang()}:${this.namespace}`;
  }

  /** Signal that flips to true when the namespace resources are available. */
  get readySignal(): Signal<boolean> {
    return this.core.readySignal(this.namespace, this.buildVersion ?? undefined);
  }

  /** Convenience boolean wrapper around the readiness signal. */
  get ready(): boolean {
    return this.core.readySignal(this.namespace, this.buildVersion ?? undefined)();
  }

  constructor(
    @Inject(TRANSLATION_NAMESPACE) public readonly namespaceInput: string,
  ) {
    this.namespace = namespaceInput;
    effect(() => {
      const nsKey = this.getNskey;
      if (!this.ready) {
        this.info(`Namespace "${this.namespace}" is not ready. Loading for "${this.lang()}" using key "${nsKey}".`);
        this.core.load(nsKey, () => this.loader.load(this.config.i18nRoots, this.namespace, this.lang()));
      }
    })
  }

  /** Switches the active language and triggers downstream refresh logic. */
  setLang(lang: string): void {
    this.info(`setLang called with "${lang}".`);
    this.core.setLang(lang);
  }

  /**
   * Resolves the translation for `key`, formatting with the provided params
   * and falling back to configured behaviors when a translation is missing.
   */
  t(key: string, params: Params = {}): string {
    const nsKey = this.getNskey;
    const missingResult = this.getMissingTranslation(key);
    if (!this.ready) {
      this.warn(`Namespace "${this.namespace}" is not ready.`);
      return '';
    }
    const formatResult = this.core.getAndCreateFormatter(nsKey, key);
    if (formatResult) return formatResult.format(params);

    if (this.config.enablePageFallback && !this.isPageRoot && this.parent) {
      return this.parent.t(key, params);
    }
    const fallback = this.core.findFallbackFormatter(key, [], this.buildVersion ?? undefined);
    if (fallback) {
      this.info(`Resolved key "${key}" via fallback namespace while rendering "${this.namespace}".`);
      return fallback.format(params);
    }
    this.warn(`Missing translation for key "${key}" in namespace "${this.namespace}". Returning fallback value.`);
    return missingResult;
  }

  /** Determines the fallback string or error when a translation entry is missing. */
  private getMissingTranslation(key?: string): string | never {
    const forceMode = this.config.missingTranslationBehavior ?? 'show-key';
    switch (forceMode) {
      case 'throw-error':
        throw new Error(`[i18n] Missing translation: ${key} in ${this.namespace}`);
      case 'empty':
        this.warn(`Missing translation returned an empty string for key "${key}" in namespace "${this.namespace}".`);
        return '';
      case 'show-key':
        if (key) {
          this.warn(`Showing key "${key}" because no translation was found in namespace "${this.namespace}".`);
        }
        return key ?? '';
      default: return forceMode;
    }
  }

  /** Pass-through helpers that delegate resource management to the core service. */
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
  getAllBundle() {
    return this.core.getAllBundle();
  }
  removeResourceBundle(...p: Parameters<TranslationCoreService['removeResourceBundle']>) {
    return this.core.removeResourceBundle(...p);
  }
  preloadNamespaces(...p: Parameters<TranslationCoreService['preloadNamespaces']>) {
    return this.core.preloadNamespaces(...p);
  }

  /** Emits debug info when verbose logging is enabled. */
  private info(message: string, ...details: unknown[]): void {
    if (!this.debugEnabled) return;
    if (details.length) {
      console.info(`[ngx-atomic-i18n] ${message}`, ...details);
    } else {
      console.info(`[ngx-atomic-i18n] ${message}`);
    }
  }

  /** Emits debug warnings when verbose logging is enabled. */
  private warn(message: string, ...details: unknown[]): void {
    if (!this.debugEnabled) return;
    if (details.length) {
      console.warn(`[ngx-atomic-i18n] ${message}`, ...details);
    } else {
      console.warn(`[ngx-atomic-i18n] ${message}`);
    }
  }
}
