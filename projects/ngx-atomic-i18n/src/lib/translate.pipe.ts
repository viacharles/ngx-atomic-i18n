import { inject, Pipe, PipeTransform } from "@angular/core";
import { TranslationService } from "./translation.service";
import { Params } from "./translate.type";
import { TRANSLATION_CONTEXT } from "./translate.token";

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslationPipe implements PipeTransform {
    private cx = inject(TRANSLATION_CONTEXT)
    private ts = inject(TranslationService);
    transform(key: string, params?: Params) {
        if (key === 'welcome') {
            console.log('aa-pipe transform', key, this.ts.currentLang(), this.ts.translate(key, params)())
        }
        const lang = this.ts.currentLang();
        return this.ts.translate(key, params)();
    }
}