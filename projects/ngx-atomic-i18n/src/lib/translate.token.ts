import { InjectionToken } from "@angular/core";
import { TranslationConfig } from "./translate.type";

export const TRANSLATION_NAMESPACE = new InjectionToken<string>('TRANSLATION_NAMESPACE');
export const TRANSLATION_CONFIG = new InjectionToken<TranslationConfig>('TRANSLATION_CONFIG');
export const INITIAL_I18N_LANG = new InjectionToken<string>('INITIAL_I18N_LANG');

