import { HttpClient } from "@angular/common/http";
import { Signal } from "@angular/core";

/** Global configuration contract used by the translation system. */
export interface TranslationConfig {
  supportedLangs: string[];
  fallbackLang: string;
  i18nRoots: string[];
  pathTemplates: string[] | string;
  fallbackNamespace: string | string[];
  langDetectionOrder: ('localStorage' | 'url' | 'browser' | 'customLang' | 'fallback')[];
  /** Enable verbose logging. Defaults to true in dev mode. */
  debug?: boolean;
  /** Enable use  */
  enablePageFallback: boolean;
  preloadNamespaces?: string[];
  customLang?: (() => string) | string;
  missingTranslationBehavior?: MissingTranslationBehavior;
}

/** Metadata passed into consumers to indicate namespace readiness. */
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
export type MissingTranslationBehavior = 'show-key' | 'empty' | 'throw-error';

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
  /** Minimal subset of Node's fs API needed by the SSR loader. */
  readFileSync(path: string, encoding: 'utf8'): string;
  statSync(path: string): any
}

/** Options used to customise the SSR file-system loader. */
export interface FsLoaderOptions {
  /**  only for SSR , e.g. process.cwd() */
  baseDir?: string;
  /** e.g. 'projects/app/src/assets' (dev) or 'dist/app/browser/assets' (prod) */
  assetPath?: string;
  /** Custom resolver that returns an ordered list of candidate absolute paths. */
  resolvePaths?: (ctx: {
    baseDir: string;
    assetPath: string;
    root: string;
    lang: string;
    namespace: string;
  }) => string[];
  /** Custom fs module instance (takes precedence over dynamic imports). */
  fsModule?: FsModuleLike;
  cacheMax?: number;
}

/** Options used to customise the HTTP loader in CSR environments. */
export interface HttpLoaderOptions {
  /** default '/assets' */
  baseUrl?: string;
}

/** Aggregate options exposed via `provideTranslationInit`. */
export interface TranslationLoaderOptions {
  forceMode?: 'ssr' | 'csr';
  ssrLoader?: () => TranslationLoader;                    // custom SSR loader
  csrLoader?: (http: HttpClient) => TranslationLoader;    // custom CSR loader
  fsOptions?: FsLoaderOptions;          //options for FsTranslationLoader
  httpOptions?: HttpLoaderOptions;         // options for HttpTranslationLoader
}

export type CacheEntry = { mtimeMs: number, data: Translations };

export type PathTemplate = string | string[] | undefined;

export enum TempToken {
  /** Placeholder for the language code inside loader path templates. */
  Lang = '{{lang}}',
  /** Placeholder for the namespace inside loader path templates. */
  Namespace = '{{namespace}}',
  /** Placeholder for the root folder inside loader path templates. */
  Root = '{{root}}'
}
