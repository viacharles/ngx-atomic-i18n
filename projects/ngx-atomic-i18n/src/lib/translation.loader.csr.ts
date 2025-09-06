import { HttpClient } from "@angular/common/http";
import { HttpLoaderOptions, TempToken, TranslationLoader, Translations } from "./translate.type";
import { firstValueFrom } from "rxjs";
import { toArray } from "./translate.util";

export class HttpTranslationLoader implements TranslationLoader {
  private templateCache?: string;
  constructor(
    private readonly http: HttpClient,
    private readonly option: HttpLoaderOptions = {}
  ) { }
  async load(i18nRoots: string[], namespace: string, lang: string): Promise<Translations> {
    const roots = toArray(i18nRoots) ?? [];
    const baseInput = this.option.httpBaseUrl ?? '/assets';
    console.log('HttpTranslationLoader baseInput:', baseInput);
    const base = (/^https?:\/\//i.test(baseInput)
      ? baseInput
      : (baseInput.startsWith('/') ? baseInput : '/' + baseInput)).replace(/[\\/]+$/, '');

    const template = toArray(this.option.pathTemplates) ?? [`i18n/${TempToken.Namespace}/${TempToken.Lang}.json`];
    const orderedTemps = this.templateCache ? [this.templateCache, ...template.filter(t => t !== this.templateCache)] : template;
    for (const root of roots) {
      for (const temp of orderedTemps) {
        const url = `${base}/${temp.replace(TempToken.Root, root).replace(TempToken.Lang, lang).replace(TempToken.Namespace, namespace)}`;
        try {
          const json = await firstValueFrom(
            this.http.get<Translations>(url)
          );
          if (!this.templateCache) this.templateCache = temp;
          return json;
        } catch {
          /* ignore  */
        }
      }
    }
    throw new Error(`[i18n] ${namespace}.json for ${lang} not found in any i18nRoot`);
  }
}
