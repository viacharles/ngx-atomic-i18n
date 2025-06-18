import { Signal } from "@angular/core";

export interface TranslationConfig {
    supportedLangs: string[];
    fallbackLang: string;
    staticLang?: string;
    initialLang?: () => string | string;
    i18nRoot: string;
}

export interface TranslationContext {
    namespace: string;
    ready?: Signal<boolean>;
}

export type LazyLoader = Record<Lang, () => Promise<Translations>>;
export type Params = Record<string, any>;
export type Translations = Record<string, string>;
export type Lang = string




