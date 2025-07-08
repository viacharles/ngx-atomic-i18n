import { InjectionToken } from "@angular/core";
import { TranslationConfig, TranslationLoader } from "./translate.type";

export const TRANSLATION_NAMESPACE = new InjectionToken<string>('TRANSLATION_NAMESPACE');
export const TRANSLATION_CONFIG = new InjectionToken<TranslationConfig>('TRANSLATION_CONFIG');
export const TRANSLATION_LOADER = new InjectionToken<TranslationLoader>('TranslationLoader');
export const STATIC_I18N_LANG = new InjectionToken<string>('STATIC_I18N_LANG');
export const ICU_FORMATTER_TOKEN = new InjectionToken<any>('ICU_FORMATTER_TOKEN'); 
