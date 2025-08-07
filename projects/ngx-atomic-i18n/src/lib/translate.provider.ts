import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, inject, PLATFORM_ID, Provider } from "@angular/core";
import { HttpTranslationLoader } from "./translation.loader.csr";
import { detectPreferredLang } from "./translate.util";
import { isPlatformServer } from "@angular/common";
import { TranslationService } from "./translation.service";
import { TranslationConfig, TranslationLoaderOptions } from "./translate.type";
import { TRANSLATION_CONFIG, TRANSLATION_LOADER, TRANSLATION_NAMESPACE } from "./translate.token";
import { FsTranslationLoader } from "./translation.loader.ssr";

export function provideTranslationInit(userConfig?: Partial<TranslationConfig>): Provider[] {
  const defaultCongig = {
    supportedLangs: ['en'],
    fallbackNamespace: 'common',
    fallbackLang: 'en',
    initialLang: 'en',
    i18nRoots: ['i18n'],
    missingTranslationBehavior: 'show-key',
    langDetectionOrder: ['localStorage', 'url', 'browser', 'initialLang', 'fallback'],
  };
  const finalConfig = {
    ...defaultCongig,
    ...userConfig,
  } as TranslationConfig;
  const preferredLang = detectPreferredLang(finalConfig);
  return [
    {
      provide: TRANSLATION_CONFIG,
      useValue: {
        ...finalConfig,
        initialLang: preferredLang
      },
    },
    ...provideTranslationLoader(),
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
        }
      },
      deps: [TranslationService],
      multi: true
    }
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

export function provideTranslationLoader(options: TranslationLoaderOptions = { loaderOptions: { basePath: process.cwd(), assetPath: 'dist/browser/assets' } }): Provider[] {
  return [
    {
      provide: TRANSLATION_LOADER,
      useFactory: (platformId: Object) => {
        const isSSR = options.force === 'ssr' || (options.force !== 'csr' && isPlatformServer(platformId));
        if (isSSR) {
          return options.ssrLoader?.() ?? new FsTranslationLoader(options.loaderOptions?.basePath, options.loaderOptions?.assetPath);
        } else {
          const http = inject(HttpClient);
          return options.csrLoader?.(http) ?? new HttpTranslationLoader(http);
        }
      },
      deps: [PLATFORM_ID],
    }
  ];
}
