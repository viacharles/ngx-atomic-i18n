import { InjectionToken } from "@angular/core";
import { TranslationConfig, TranslationLoader } from "./translate.type";

/** Scoped namespace for translating a component tree (string or array). */
export const TRANSLATION_NAMESPACE = new InjectionToken<string>('TRANSLATION_NAMESPACE');
/** Root configuration describing language support and loader behavior. */
export const TRANSLATION_CONFIG = new InjectionToken<TranslationConfig>('TRANSLATION_CONFIG');
/** Factory used to retrieve translation JSON for a namespace/language tuple. */
export const TRANSLATION_LOADER = new InjectionToken<TranslationLoader>('TRANSLATION_LOADER');
/** Optional build fingerprint appended to namespace cache keys. */
export const BUILD_VERSION = new InjectionToken<string | null>('BUILD_VERSION');
/** Custom ICU formatter constructor injected by the host app when available. */
export const ICU_FORMATTER_TOKEN = new InjectionToken<any>('ICU_FORMATTER_TOKEN');

export const PAGE_TRANSLATION_ROOT = new InjectionToken<boolean>('PAGE_TRANSLATION_ROOT');
