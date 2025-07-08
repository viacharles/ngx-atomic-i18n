import { TranslationLoader, Translations } from "./translate.type";



export class FsTranslationLoader implements TranslationLoader {
    async load(i18nRoot: string[], ns: string, lang: string): Promise<Translations> {
        const { join } = await import('node:path');
        const { readFileSync } = await import('node:fs');

        for (const root of i18nRoot) {
            try {
                const file = join(process.cwd(), 'dist/browser/assets', root, lang, `${ns}.json`);
                return JSON.parse(readFileSync(file, 'utf8'));
            } catch {
                /* ignore */
            }
        }
        throw new Error(`[SSR i18n] ${ns}.json for ${lang} not found in any i18nRoot`);
    }
}