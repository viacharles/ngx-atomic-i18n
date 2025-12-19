import { SIZE } from 'projects/ngx-i18n-demo/src/app/shared/enums/common.enum';
import { Component, effect, inject, Injector, input, signal } from '@angular/core';
import { CustomNgForm, getCustomNgFormProvider } from '../../../value-accessor';
import { Option } from 'projects/ngx-i18n-demo/src/app/shared/interfaces/common.interface';
import { DropdownDialogComponent } from '../../../../dialog-system/components/dropdown-dialog/dropdown-dialog.component';
import { DialogService } from '../../../../dialog-system/dialog.service';
import { provideTranslation, TranslationPipe } from 'ngx-atomic-i18n';

@Component({
  selector: 'app-select',
  imports: [TranslationPipe],
  standalone: true,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [getCustomNgFormProvider(SelectComponent), provideTranslation('select')],
})
export class SelectComponent extends CustomNgForm {
  private readonly selfInject = inject(Injector);
  title = input('');
  placeholder = input('請選擇');
  options = input<Option[]>([]);
  error = input<boolean>(false);
  size = input(SIZE.MEDIUM);
  showName = signal<string>('');

  constructor(private dialogService: DialogService) {
    super();
    effect(() => {
      const name = this.options().find(o => o.value === this.valueSig())?.name;
      this.showName.set(name ?? '');
    }, { allowSignalWrites: true })
  }

  openDropdown(selectEl: HTMLElement): void {
    this.onTouched();
    this.dialogService
      .open(
        DropdownDialogComponent,
        {
          data: {
            options: this.options(),
            title: this.placeholder(),
            anchorEl: selectEl,
            minHeight: 300,
            margin: 8
          },
        },
        {
          closeOnBackdropClick: true,
          transparentBackdrop: true,
        },
        this.selfInject
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.valueSig.set(res.value);
          this.showName.set(res.name);
          this.onChange(res.value);
        }
      });
  }
}
