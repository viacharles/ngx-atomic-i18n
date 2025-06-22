import { Inject, inject, Injectable, Optional, Signal, signal } from '@angular/core';
import { detectPreferredLang, toObservable } from './translate.util';
import { INITIAL_I18N_LANG, TRANSLATION_CONFIG, TranslationConfig } from 'ngx-atomic-i18n';

@Injectable({
  providedIn: 'root'
})
export class TranslationCoreService {
  // TODO: 如何確保 TranslationCoreService 能在 TRANSLATION_CONFIG 有值後才 inject ?
  private readonly _config = inject(TRANSLATION_CONFIG);
  private readonly _lang = signal(detectPreferredLang(this._config));
  readonly lang = this._lang.asReadonly();
  // TODO:用 lang 和 _lang 有什麼差別？
  readonly onLangChange = toObservable(this._lang);
  readonly fallbackLang = this._config.fallbackLang ?? 'en';

  get currentLang(): Signal<string> {
    return this._lang;
  }

  constructor(
    @Inject(TRANSLATION_CONFIG) private readonly config: TranslationConfig,
    @Optional() @Inject(INITIAL_I18N_LANG) private readonly staticLang?: string,
  ) { }

  setLang(lang?: string): void {
    const currentLang = lang ?? this.detectPreferredLang(this.config);
    if (!this._config.supportedLangs.includes(currentLang)) {
      console.warn(`[i18n] Unsupported language: ${currentLang}`);
      return;
    }
    if (this._lang() !== currentLang) {
      this._lang.set(currentLang);
      console.log('aa-setLang', this._lang())
      const isBroswer = typeof window !== 'undefined';
      if (isBroswer) {
        try {
          localStorage.setItem('lang', this._lang());
        } catch (err) {
          console.warn('[i18n] Failed to write to localStorage', err);
        }
      }
    }
  }

  private detectPreferredLang(config: TranslationConfig): string {
    if (this.staticLang) return this.staticLang;
    return detectPreferredLang(config);
  }
}
