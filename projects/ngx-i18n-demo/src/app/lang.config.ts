export const SUPPORTED_LANG = ['en', 'zh-Hant'] as const;
export type LangCode = (typeof SUPPORTED_LANG)[number];
export const LANG_ALIASES: Record<string, LangCode> = {
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  zh: 'zh-Hant',
  'zh-TW': 'zh-Hant',
  'zh-HK': 'zh-Hant',
  'zh-MO': 'zh-Hant',
  'zh-Hant': 'zh-Hant'
}
export function normalizeLangCode(lang: string | null | undefined): LangCode | null {
  if (!lang) return null;
  return lang ? LANG_ALIASES[lang.trim()] : null;
}
