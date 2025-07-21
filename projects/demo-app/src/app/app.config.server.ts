import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslationInit } from 'ngx-atomic-i18n/translate.provider';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslationInit({
      supportedLangs: ['en', 'zh-Hant']
    })
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
