import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslationInit } from 'ngx-atomic-i18n/translate.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] }),
  ]
};
