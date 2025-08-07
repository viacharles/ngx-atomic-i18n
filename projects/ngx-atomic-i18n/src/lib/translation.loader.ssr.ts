import { TranslationLoader, Translations } from "./translate.type";

export interface FsModuleLike {
  readFileSync(path: string, encoding: 'utf8'): string;
}

export class FsTranslationLoader implements TranslationLoader {
  constructor(
    private basePath = process.cwd(),
    private assetPath = 'dist/browser/assets',
    private fsModule?: FsModuleLike
  ) { }
  async load(i18nRoot: string[], ns: string, lang: string): Promise<Translations> {
    const { join } = await import('node:path');
    const fs = this.fsModule ?? (await import('node:fs'));
    for (const root of i18nRoot) {
      const file = join(this.basePath, this.assetPath, root, lang, `${ns}.json`);
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        /* ignore */
      }
    }
    throw new Error(`[SSR i18n] ${ns}.json for ${lang} not found in any i18nRoot`);
  }
}
