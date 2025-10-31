import { HttpClient } from "@angular/common/http";
import { HttpLoaderOptions, TempToken, TranslationLoader, Translations } from "./translate.type";
import { firstValueFrom } from "rxjs";
import { detectBuildVersion, toArray } from "./translate.util";

/** Browser-oriented loader that fetches translation JSON over HTTP. */
export class HttpTranslationLoader implements TranslationLoader {
  private templateCache?: string;
  constructor(
    private readonly http: HttpClient,
    private readonly option: HttpLoaderOptions = {}
  ) { }
  /** Attempts to locate the namespace file across the configured roots and templates. */
  async load(i18nRoots: string[], namespace: string, lang: string): Promise<Translations> {
    const roots = toArray(i18nRoots) ?? [];
    const baseInput = this.option.httpBaseUrl ?? '/assets';
    const base = (/^https?:\/\//i.test(baseInput)
      ? baseInput
      : (baseInput.startsWith('/') ? baseInput : '/' + baseInput)).replace(/[\\/]+$/, '');

    const template = toArray(this.option.pathTemplates) ?? [`i18n/${TempToken.Namespace}/${TempToken.Lang}.json`];
    const orderedTemps = this.templateCache ? [this.templateCache, ...template.filter(t => t !== this.templateCache)] : template;
    for (const root of roots) {
      for (const temp of orderedTemps) {
        let url = `${base}/${temp.replace(TempToken.Root, root).replace(TempToken.Lang, lang).replace(TempToken.Namespace, namespace)}`;
        const v = detectBuildVersion();
        if (v) {
          url += (url.includes('?') ? '&' : '?') + `v=${encodeURIComponent(v)}`;
        }
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
