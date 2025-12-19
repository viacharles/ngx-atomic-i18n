import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';

import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideTranslationInit } from 'ngx-atomic-i18n';
import { provideHttpClient } from '@angular/common/http';
import { AppTitleService } from '../core/services/app-title.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })),
    provideClientHydration(),
    provideTranslationInit({
      supportedLangs: ['en', 'zh-Hant'],
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
