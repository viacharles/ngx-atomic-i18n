import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { TempToken, provideTranslationInit } from 'ngx-atomic-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslationInit({
      supportedLangs: ['zh'],
      fallbackLang: 'zh',
      // Assets live at /assets/common/zh.json
      pathTemplates: [`aa/${TempToken.Namespace}/${TempToken.Lang}.json`],
    })
  ]
};
