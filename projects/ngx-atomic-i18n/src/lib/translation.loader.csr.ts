import { defaultConfig } from './translate.provider';
import { HttpClient } from "@angular/common/http";
import { HttpLoaderOptions, TempToken, TranslationLoader, Translations } from "./translate.type";
import { firstValueFrom } from "rxjs";
import { detectBuildVersion, tempToArray } from "./translate.util";

export class HttpTranslationLoader implements TranslationLoader {
  private pathTemplateCache?: string;
  constructor(
    private readonly http: HttpClient,
    private readonly option: HttpLoaderOptions = {},
    private readonly pathTemplates: string[] | string,
  ) { }

  async load(i18nRoots: string[], namespace: string, lang: string): Promise<Translations> {
    const roots = tempToArray(i18nRoots) ?? [];
    const baseUrl = this.option.baseUrl ?? '/assets';
    const safeBaseUrl = (/^https?:\/\//i.test(baseUrl)
      ? baseUrl
      : (baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl)).replace(/[\\/]+$/, '');
    const tempArray = tempToArray(this.pathTemplates)
    const pathTemps = this.pathTemplateCache ? [this.pathTemplateCache, ...(tempArray ?? []).filter(t => t !== this.pathTemplateCache)] : (tempArray ?? defaultConfig.pathTemplates);
    for (const root of roots) {
      for (const temp of pathTemps) {
        let url = `${safeBaseUrl}/${temp.replace(TempToken.Root, root).replace(TempToken.Lang, lang).replace(TempToken.Namespace, namespace)}`;
        const v = detectBuildVersion();
        if (v) {
          url += (url.includes('?') ? '&' : '?') + `v=${encodeURIComponent(v)}`;
        }
        try {
          const json = await firstValueFrom(
            this.http.get<Translations>(url)
          );
          if (!this.pathTemplateCache) this.pathTemplateCache = temp;
          return json;
        } catch {
          /* ignore  */
        }
      }
    }
    throw new Error(`[i18n] ${namespace}.json for ${lang} not found in any i18nRoot`);
  }
}
