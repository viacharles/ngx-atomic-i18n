import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslationConfig } from 'ngx-atomic-i18n/translate.util';
import { TRANSLATION_CONFIG } from 'ngx-atomic-i18n';
import { TranslationService } from 'ngx-atomic-i18n/translation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideTranslationConfig({}),
    {
      provide: APP_INITIALIZER,
      useFactory: (ts: TranslationService) => {
        console.log('aa-APP_INITIALIZER', ts.currentLang())
        return () => ts.setLang(ts.currentLang());
      },
      deps: [TranslationService, TRANSLATION_CONFIG],
      multi: true
    }
  ]
};
