import { ApplicationConfig, inject, isDevMode, provideEnvironmentInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';

import { appRoutes } from './app.routes';
import { provideTranslationInit } from 'ngx-atomic-i18n';
import { provideHttpClient } from '@angular/common/http';
import { AppTitleService } from '../core/services/app-title.service';
import { I18nSourceService } from '@demo2-shared/services/i18n-source';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })),
    // provideClientHydration(),
    provideEnvironmentInitializer(() => {
      inject(I18nSourceService)
    }),
    provideTranslationInit({
      supportedLangs: ['en', 'zh-Hant', 'ja', 'ko', 'es'],
      enablePageFallback: true,
      loader: {
        fsOptions: {
          assetPath: isDevMode()
            ? 'projects/ngx-i18n-demo/src/assets'
            : 'dist/ngx-i18n-demo/browser/assets',
        },
      },
      debug: false
    }),
    {
      provide: TitleStrategy,
      useClass: AppTitleService
    }
  ]
};
