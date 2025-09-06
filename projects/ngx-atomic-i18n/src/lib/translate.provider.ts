import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, inject, isDevMode, PLATFORM_ID, Provider } from "@angular/core";
import { HttpTranslationLoader } from "./translation.loader.csr";
import { detectPreferredLang } from "./translate.util";
import { isPlatformServer } from "@angular/common";
import { TranslationService } from "./translation.service";
import { TempToken, TranslationConfig, TranslationLoader, TranslationLoaderOptions } from "./translate.type";
import { TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE } from "./translate.token";
import { FsTranslationLoader } from "./translation.loader.ssr";

export type ProvideTranslationInitOptions =
  Partial<TranslationConfig> & {
    loader?: TranslationLoaderOptions;
  };

export function provideTranslationInit(userConfig?: ProvideTranslationInitOptions): Provider[] {
  const defaultConfig: TranslationConfig = {
    supportedLangs: ['en'],
    fallbackNamespace: 'common',
    fallbackLang: 'en',
    initialLang: () => 'en',
    i18nRoots: ['i18n'],
    missingTranslationBehavior: 'show-key',
    langDetectionOrder: ['localStorage', 'url', 'browser', 'initialLang', 'fallback'],
  };
  const finalConfig = { ...defaultConfig, ...(userConfig ?? {}) } as TranslationConfig;
  const preferredLang = detectPreferredLang(finalConfig);
  return [
    {
      provide: TRANSLATION_CONFIG,
      useValue: { ...finalConfig, initialLang: preferredLang },
    },
    ...provideTranslationLoader(userConfig?.loader),
    ...provideTranslation(finalConfig.fallbackNamespace),
    {
      provide: APP_INITIALIZER,
      useFactory: (ts: TranslationService) => {
        return async () => {
          const preload = finalConfig.preloadNamespaces;
          if (preload?.length) {
            await ts.preloadNamespaces(preload, preferredLang);
          }
          ts.setLang(ts.currentLang);
        };
      },
      deps: [TranslationService],
      multi: true,
    },
  ];
}


export function provideTranslation(namespace: string | string[]): Provider[] {
  return [
    {
      provide: TRANSLATION_NAMESPACE,
      useValue: namespace,
    },
    {
      provide: TranslationService,
      useClass: TranslationService
    }
  ]
}

export function provideTranslationLoader(options: TranslationLoaderOptions = {}): Provider[] {
  return [
    {
      provide: TRANSLATION_LOADER,
      useFactory: (platformId: Object): TranslationLoader => {
        const isSSR = options.forceMode === 'ssr' || (options.forceMode !== 'csr' && isPlatformServer(platformId));
        if (isSSR) {
          const fsBaseDir =
            options.loaderOptions?.fsBaseDir ??
            (typeof process !== 'undefined' ? process.cwd() : '');
          const assetPath = options.loaderOptions?.assetPath ?? (isDevMode() ? 'src/assets' : 'dist/browser/assets');
          return options.ssrLoader?.()
            ?? new FsTranslationLoader({
              fsBaseDir,
              assetPath,
              pathTemplates: options.loaderOptions?.pathTemplates ?? [`i18n/${TempToken.Namespace}/${TempToken.Lang}.json`, `i18n/${TempToken.Lang}/${TempToken.Namespace}.json`],
              resolvePaths: options.loaderOptions?.resolvePaths,
              fsModule: options.loaderOptions?.fsModule
            });
        }
        const http = inject(HttpClient);
        return options.csrLoader?.(http)
          ?? new HttpTranslationLoader(http, {
            httpBaseUrl: options.httpOptions?.httpBaseUrl ?? '/assets',
            pathTemplates: options.httpOptions?.pathTemplates ?? `${TempToken.Root}/${TempToken.Namespace}/${TempToken.Lang}.json`
          });
      },
      deps: [PLATFORM_ID],
    }
  ];
}

