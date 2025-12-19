import { inject, Pipe, PipeTransform } from "@angular/core";
import { Params } from "./translate.type";
import { TranslationService } from "./translation.service";

@Pipe({ name: 't', standalone: true, pure: false })
/** Template helper that proxies lookups to `TranslationService.t`. */
export class TranslationPipe implements PipeTransform {
  private readonly service = inject(TranslationService);
  /** Formats the translation identified by `key` using the optional params. */
  transform(key: string, params?: Params): string {
    return this.service.t(key, params);
  }
}
