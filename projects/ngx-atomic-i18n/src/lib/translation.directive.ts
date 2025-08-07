import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { TranslationService } from './translation.service';
import { Params } from './translate.type';

@Directive({
  selector: '[t]',
  standalone: true
})
export class TranslationDirective {
  private selfElm = inject(ElementRef).nativeElement as HTMLElement;
  private service = inject(TranslationService);
  readonly t = input('');
  readonly tParams = input<Params | undefined>(undefined);
  readonly tAttr = input<string>('');
  constructor() {
    effect(() => {
      const value = this.service.t(this.t(), this.tParams());
      if (this.tAttr()) {
        this.selfElm.setAttribute(this.tAttr(), value);
      } else {
        this.selfElm.textContent = value;
      }
    });
  }
}
