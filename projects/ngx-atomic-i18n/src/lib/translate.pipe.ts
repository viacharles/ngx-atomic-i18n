import { inject, Pipe, PipeTransform } from "@angular/core";
import { Params } from "./translate.type";
import { TranslationService } from "./translation.service";
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslationPipe implements PipeTransform {
    private readonly service = inject(TranslationService);
    transform(key: string, params?: Params): string {
        return this.service.readySignal() ? this.service.t(key, params) : '';
    }
}