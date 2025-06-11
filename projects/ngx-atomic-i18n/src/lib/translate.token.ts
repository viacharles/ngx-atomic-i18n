import { InjectionToken } from "@angular/core";
import { TranslationConfig, TranslationContext } from "./translate.type";

export const TRANSLATION_CONFIG = new InjectionToken<TranslationConfig>('TRANSLATION_CONFIG');
export const TRANSLATION_CONTEXT = new InjectionToken<TranslationContext>('TRANSLATION_CONTEXT');

