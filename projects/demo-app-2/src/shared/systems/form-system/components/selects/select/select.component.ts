import { SIZE } from './../../../../../enums/common.enum';
import { Component, effect, input, signal } from '@angular/core';
import { CustomNgForm, getCustomNgFormProvider } from '../../../value-accessor';
import { Option } from '../../../../../interfaces/common.interface';
import { DropdownDialogComponent } from './../../../../dialog-system/components/dropdown-dialog/dropdown-dialog.component';
import { DialogService } from './../../../../dialog-system/dialog.service';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [getCustomNgFormProvider(SelectComponent)],
})
export class SelectComponent extends CustomNgForm {
  title = input('');
  placeholder = input('請選擇');
  options = input<Option[]>([]);
  error = input<boolean>(false);
  size = input(SIZE.MEDIUM);
  selectedOption = signal<Option | null>(null);

  constructor(private dialogService: DialogService) {
    super();
    effect(() => {
      this.syncSelected(this.valueSig());
    });
  }

  openDropdown(): void {
    this.onTouched();
    this.dialogService
      .open(
        DropdownDialogComponent,
        {
          data: {
            options: this.options(),
            title: this.title()
          },
        },
        {
          closeOnBackdropClick: true,
        },
      )
      .ref.afterClosed()
      .subscribe((res) => {
        if (res) {
          this.valueSig.set(res.value);
          this.onChange(res.value);
        }
      });
  }

  private syncSelected(value: string | null): void {
    const target = this.options().find((option) => option.value === this.valueSig());
    this.selectedOption.set(target ?? null);
  }
}
