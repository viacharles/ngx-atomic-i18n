import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { ALIGN } from '@demo2-shared/enums/common.enum';
import { IconCrossComponent } from '@demo2-shared/components/icons/icon-cross/icon-cross.component';
import { DialogModel } from '../../dialog.model';

@Component({
  selector: 'app-page-dialog-container',
  standalone: true,
  imports: [IconCrossComponent],
  templateUrl: './page-dialog-container.component.html',
  styleUrl: './page-dialog-container.component.scss',
})
export class PageDialogContainerComponent {
  @Output() goBack = new EventEmitter<boolean>();
  title = input('');
  subTitle = input<string>('');
  align = input<ALIGN>(ALIGN.LEFT);
  background = input<string | undefined>(undefined);
  dialogRef = inject(DialogModel)

  back() {
    this.dialogRef.close();
    this.goBack.emit(true);
  }
}
