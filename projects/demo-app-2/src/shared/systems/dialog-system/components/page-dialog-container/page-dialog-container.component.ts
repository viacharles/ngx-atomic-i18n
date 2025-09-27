import { Component, EventEmitter, input, Output } from '@angular/core';
import { ALIGN } from '@mini:shared/enums/common.enum';

@Component({
  selector: 'app-page-dialog-container',
  imports: [],
  templateUrl: './page-dialog-container.component.html',
  styleUrl: './page-dialog-container.component.scss',
})
export class PageDialogContainerComponent {
  @Output() goBack = new EventEmitter<boolean>();
  title = input('');
  subTitle = input<string>('');
  align = input<ALIGN>(ALIGN.LEFT);
  backbround = input<string | undefined>(undefined);

  back() {
    this.goBack.emit(true);
  }
}
