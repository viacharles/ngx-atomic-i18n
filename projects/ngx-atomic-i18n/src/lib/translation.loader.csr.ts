import { HttpClient } from "@angular/common/http";
import { TranslationLoader, Translations } from "./translate.type";
import { firstValueFrom } from "rxjs";

export class HttpTranslationLoader implements TranslationLoader {
    constructor(private http: HttpClient) { }
    async load(i18nRoots: string[], namespace: string, lang: string): Promise<Translations> {
        console.log('aa-load', i18nRoots)
        for (const root of i18nRoots) {
            try {
                const json = await firstValueFrom(
                    this.http.get<Translations>(`assets/${root}/${namespace}/${lang}.json`)
                );
                return json;
            } catch {
                /* ignore  */
            }
        }
        throw new Error(`[i18n] ${namespace}.json for ${lang} not found in any i18nRoot`);
    }
}
