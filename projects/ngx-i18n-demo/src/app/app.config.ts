import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideTranslationInit } from 'ngx-i18n';
import { provideHttpClient } from '@angular/common/http';
import { AppTitleService } from '../core/services/app-title.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(appRoutes),
    provideClientHydration(),
    provideTranslationInit({
      supportedLangs: ['en', 'zh-Hant'],
      loader: {
        loaderOptions: {
          assetPath: isDevMode()
            ? 'projects/ngx-i18n-demo/src/assets'
            : 'dist/ngx-i18n-demo/browser/assets',
        },
      },
    }),
    {
      provide: TitleStrategy,
      useClass: AppTitleService
    }
  ]
};
