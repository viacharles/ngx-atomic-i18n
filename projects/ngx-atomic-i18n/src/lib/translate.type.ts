import { HttpClient } from "@angular/common/http";
import { Signal } from "@angular/core";

export interface TranslationConfig {
  supportedLangs: string[];
  fallbackLang: string;
  i18nRoots: string[];
  fallbackNamespace: string | string[];
  langDetectionOrder: ('localStorage' | 'url' | 'browser' | 'initialLang' | 'fallback')[];
  preloadNamespaces?: string[];
  initialLang?: () => string | string;
  missingTranslationBehavior?: MissingTranslationBehavior;
}

export interface TranslationContext {
  namespace: string;
  ready?: Signal<boolean>;
}

export type LazyLoader = Record<Lang, () => Promise<Translations>>;
export type Params = Record<string, any>;
export type Translations = Record<string, string>;
export type Lang = string;
/** lang:namespace:version */
export type nsKey = string;
/**
 * How the translation system should behave when a translation key is missing.
 *
 * - 'show-key': Display the key itself (e.g., `'menu.about'`) as a fallback.
 * - 'empty': Show an empty string. Use this if you prefer untranslated text to disappear silently.
 * - 'throw': Throw a runtime error. Recommended only during development or testing; will break the UI if not handled.
 * - string: Any custom string, e.g., '--', 'loading...', etc.
 */
export type MissingTranslationBehavior = 'show-key' | 'empty' | 'throw' | string;

export interface TranslationLoader {
  /**
 * @param i18nRoot  List of base folders to look for JSON (ordered by priority)
 * @param ns        Namespace, e.g. "home" or "auth-login"
 * @param lang      Language code, e.g. "en" or "zh-Hant"
 */
  load(i18nRoots: string[], namespace: string, lang: string): Promise<Translations>;
}

export type FormatResult = { format(params: Record<string, any>): string }

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface FsModuleLike {
  readFileSync(path: string, encoding: 'utf8'): string;
  statSync(path: string): any
}

export interface FsLoaderOptions {
  /** e.g. process.cwd() only for SSR */
  fsBaseDir?: string;
  /** e.g. 'projects/app/src/assets' (dev) or 'dist/app/browser/assets' (prod) */
  assetPath?: string;
  /** template , accept {{root}} {{lang}} {{namespace}} */
  pathTemplates?: string[];
  /**
   * priority to resolve
   */
  resolvePaths?: (ctx: {
    fsBaseDir: string;
    assetPath: string;
    root: string;
    lang: string;
    namespace: string;
  }) => string[];
  /** custom fs */
  fsModule?: FsModuleLike;
  cacheMax?: number;
}

export interface HttpLoaderOptions {
  /** default '/assets' */
  httpBaseUrl?: string;
  /** default 'i18n/{{namespace}}/{{lang}}.json' */
  pathTemplates?: string | string[];

}

export interface TranslationLoaderOptions {
  forceMode?: 'ssr' | 'csr';
  ssrLoader?: () => TranslationLoader;                    // custom SSR loader
  csrLoader?: (http: HttpClient) => TranslationLoader;    // custom CSR loader
  loaderOptions?: FsLoaderOptions;          //options for FsTranslationLoader
  httpOptions?: HttpLoaderOptions;         // options for HttpTranslationLoader
}

export type CacheEntry = { mtimeMs: number, data: Translations };

export type PathTemplate = string | string[] | undefined;

export enum TempToken {
  Lang = '{{lang}}',
  Namespace = '{{namespace}}',
  Root = '{{root}}'
}


