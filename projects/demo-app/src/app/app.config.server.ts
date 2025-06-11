import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TRANSLATION_CONFIG } from 'ngx-atomic-i18n';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: TRANSLATION_CONFIG,
      useValue: {
        supportedLangs: ['zh-Hant', 'en'],
        fallbackLang: 'zh-Hant',
        initialLang: 'zh-Hant',
        i18nRoot: 'app/features'
      }
    },

  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
