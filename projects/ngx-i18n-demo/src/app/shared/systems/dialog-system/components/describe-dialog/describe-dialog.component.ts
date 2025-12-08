import { Component, inject } from '@angular/core';
import { IconCrossComponent } from '@demo2-shared/icons/icon-cross/icon-cross.component';
import { DialogModel } from '../../dialog.model';
import { DIALOG_DATA } from '../../dialog.token';

@Component({
  selector: 'app-describe-dialog',
  standalone: true,
  imports: [IconCrossComponent],
  templateUrl: './describe-dialog.component.html',
  styleUrl: './describe-dialog.component.scss'
})
export class DescribeDialogComponent {
  dialogRef = inject(DialogModel);
  data = inject(DIALOG_DATA);
}
