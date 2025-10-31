import { mergeApplicationConfig, ApplicationConfig, isDevMode } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslationInit } from '../../../ngx-i18n/src/public-api';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslationInit({
      supportedLangs: ['en', 'zh-Hant'],
      loader: {
        loaderOptions: {
          assetPath: isDevMode()
            ? 'projects/demo-app/src/assets'
            : 'dist/demo-app/browser/assets',
        },
      },
    })
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
