import { Component, inject } from '@angular/core';
import { DialogModel } from '../../dialog.model';
import { DIALOG_DATA } from '../../dialog.token';
import { TranslationPipe } from 'ngx-atomic-i18n';
import { IconCrossComponent } from '@demo2-shared/components/icons/icon-cross/icon-cross.component';

@Component({
  selector: 'app-describe-dialog',
  standalone: true,
  imports: [IconCrossComponent, TranslationPipe],
  templateUrl: './describe-dialog.component.html',
  styleUrl: './describe-dialog.component.scss'
})
export class DescribeDialogComponent {
  dialogRef = inject(DialogModel);
  data = inject(DIALOG_DATA);
}
