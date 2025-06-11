import { inject, Pipe, PipeTransform } from "@angular/core";
import { TranslationService } from "./translation.service";
import { Params } from "./translate.type";

@Pipe({ name: 't', standalone: true, pure: true })
export class TranslationPipe implements PipeTransform {
    private ts = inject(TranslationService);
    transform(key: string, params?: Params) {
        if (key === 'welcome') {
            console.log('aa-transform', key, this.ts.currentLang())
        }
        return this.ts.translate(key, params)();
    }
}