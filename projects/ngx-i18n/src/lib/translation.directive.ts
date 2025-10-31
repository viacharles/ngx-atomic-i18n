import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { TranslationService } from './translation.service';
import { Params } from './translate.type';

@Directive({
  selector: '[t]',
  standalone: true
})
/** Binds translation keys to an element, updating text or attributes reactively. */
export class TranslationDirective {
  private selfElm = inject(ElementRef).nativeElement as HTMLElement;
  private service = inject(TranslationService);
  /** Translation key resolved for the host element. */
  readonly t = input('');
  /** Optional interpolation parameters passed to the translation formatter. */
  readonly tParams = input<Params | undefined>(undefined);
  /** Attribute name to receive the translated value instead of textContent. */
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
