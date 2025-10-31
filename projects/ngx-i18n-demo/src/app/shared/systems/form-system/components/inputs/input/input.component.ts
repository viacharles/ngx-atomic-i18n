import { Component, input, output } from '@angular/core';
import { FuncBtn } from 'projects/ngx-i18n-demo/src/app/shared/systems/form-system/form.type';
import { CustomNgForm } from 'projects/ngx-i18n-demo/src/app/shared/systems/form-system/value-accessor';
import { SIZE } from 'projects/ngx-i18n-demo/src/app/shared/enums/common.enum';
import { getCustomNgFormProvider } from '../../../value-accessor';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  standalone: true,
  providers: [getCustomNgFormProvider(InputComponent)],
})
export class InputComponent extends CustomNgForm {
  title = input('');
  placeholder = input('請輸入');
  size = input<SIZE>(SIZE.MEDIUM);
  funcBtn = input<FuncBtn | null>(null);
  isLoading = input<boolean>(false);
  error = input<boolean>(false);
  funcBtnEvent = output<void>();

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.valueSig.set((event.target as HTMLInputElement).value ?? '');
    this.onChange(value);
  }

  funcBtnclick() {
    this.funcBtnEvent.emit();
  }
}
