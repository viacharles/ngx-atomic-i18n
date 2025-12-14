import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, inject, isDevMode, PLATFORM_ID, Provider, TransferState, makeStateKey, Optional } from "@angular/core";
import { HttpTranslationLoader } from "./translation.loader.csr";
import { detectPreferredLang } from "./translate.util";
import { isPlatformServer } from "@angular/common";
import { TranslationService } from "./translation.service";
import { TempToken, TranslationConfig, TranslationLoader, TranslationLoaderOptions } from "./translate.type";
import { BUILD_VERSION, CLIENT_REQUEST_LANG, PAGE_TRANSLATION_ROOT, TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE } from "./translate.token";
import { FsTranslationLoader } from "./translation.loader.ssr";

export type ProvideTranslationInitOptions =
  Partial<TranslationConfig> & {
    loader?: TranslationLoaderOptions;
    /** Optional global build version for SSR/CSR to align caches */
    buildVersion?: string | null;
  };

export const defaultConfig: TranslationConfig = {
  supportedLangs: ['en'],
  fallbackNamespace: 'common',
  fallbackLang: 'en',
  i18nRoots: ['i18n'],
  pathTemplates: [`${TempToken.Root}/${TempToken.Namespace}/${TempToken.Lang}.json`],
  enablePageFallback: false,
  missingTranslationBehavior: 'show-key',
  langDetectionOrder: ['url', 'clientRequest', 'localStorage', 'browser', 'customLang', 'fallback'],
  clientRequestLang: null,
};

const CLIENT_REQUEST_LANG_STATE_KEY = makeStateKey<string | null>('NGX_I18N_CLIENT_REQUEST_LANG');

function resolveClientRequestLang(
  platformId: Object,
  transferState: TransferState | null | undefined,
  providedLang: string | null
): string | null {
  const stored = transferState?.get(CLIENT_REQUEST_LANG_STATE_KEY, null);
  if (stored) return stored;

  const resolved = providedLang ?? null;
  if (resolved && transferState && isPlatformServer(platformId)) {
    transferState.set(CLIENT_REQUEST_LANG_STATE_KEY, resolved);
  }
  return resolved;
}
/** Bootstraps the entire translation infrastructure for an application. */
export function provideTranslationInit(userConfig?: ProvideTranslationInitOptions): Provider[] {
  const debugEnabled = userConfig?.debug ?? isDevMode();
  const baseConfig = { ...defaultConfig, ...(userConfig ?? {}), debug: debugEnabled } as TranslationConfig;
  if (debugEnabled) {
    console.info('[ngx-i18n] Debug logging is enabled.');
  }
  return [
    {
      provide: TRANSLATION_CONFIG,
      useFactory: (platformId: Object, transferState: TransferState | null | undefined, clientRequestLang: string | null) => {
        const requestLang = resolveClientRequestLang(platformId, transferState, clientRequestLang ?? baseConfig.clientRequestLang ?? null);
        const finalConfig = { ...baseConfig, clientRequestLang: requestLang } as TranslationConfig;
        const preferredLang = detectPreferredLang(finalConfig);
        return { ...finalConfig, customLang: preferredLang };
      },
      deps: [PLATFORM_ID, [new Optional(), TransferState], [new Optional(), CLIENT_REQUEST_LANG]],
    },
    {
      provide: BUILD_VERSION,
      useValue: userConfig?.buildVersion ?? null,
    },
    ...provideTranslationLoader(baseConfig),
    ...provideTranslation(baseConfig.fallbackNamespace),
    {
      provide: APP_INITIALIZER,
      useFactory: (ts: TranslationService) => {
        return async () => {
          const preload = baseConfig.preloadNamespaces;
          if (preload?.length) {
            await ts.preloadNamespaces(preload, ts.currentLang);
          }
          ts.setLang(ts.currentLang);
        };
      },
      deps: [TranslationService],
      multi: true,
    },
  ];
}


/** Provides the component-scoped namespace injection for component-registered service.
 * @param namespace The namespace or namespaces owned by the component.
 * @param isPage Whether the component is a top-level page (defaults to false).
*/
export function provideTranslation(namespace: string, isPage: boolean = false): Provider[] {
  return [
    {
      provide: TRANSLATION_NAMESPACE,
      useValue: namespace,
    },
    TranslationService,
    ...(isPage ? [{
      provide: PAGE_TRANSLATION_ROOT,
      useValue: true,
    }] : []),
  ]
}

/** Configures the runtime translation loader for CSR or SSR environments. */
export function provideTranslationLoader(config: ProvideTranslationInitOptions): Provider[] {
  return [
    {
      provide: TRANSLATION_LOADER,
      useFactory: (platformId: Object): TranslationLoader => {
        const options = config.loader ?? {};
        const finalPathTemplates = config.pathTemplates ?? defaultConfig.pathTemplates;
        const isSSR = options.forceMode === 'ssr' || (options.forceMode !== 'csr' && isPlatformServer(platformId));
        if (isSSR) {
          const baseDir =
            options.fsOptions?.baseDir ??
            (typeof process !== 'undefined' ? process.cwd() : '');
          const assetPath = options.fsOptions?.assetPath ?? (isDevMode() ? 'src/assets' : 'dist/browser/assets');
          return options.ssrLoader?.()
            ?? new FsTranslationLoader({
              baseDir,
              assetPath,
              resolvePaths: options.fsOptions?.resolvePaths,
              fsModule: options.fsOptions?.fsModule
            }, finalPathTemplates);
        }
        const http = inject(HttpClient);
        return options.csrLoader?.(http)
          ?? new HttpTranslationLoader(http, {
            baseUrl: options.httpOptions?.baseUrl ?? '/assets',
          }, finalPathTemplates);
      },
      deps: [PLATFORM_ID],
    }
  ];
}
