import { AfterViewInit, Component, inject } from '@angular/core';
import { Option } from '@mini:shared/interfaces/common.interface';
import { timer } from 'rxjs';
import { DialogRef } from '../../dialog.model';
import { DIALOG_DATA } from '../../dialog.token';

@Component({
  selector: 'app-dropdown-dialog',
  imports: [],
  templateUrl: './dropdown-dialog.component.html',
  styleUrl: './dropdown-dialog.component.scss',
})
export class DropdownDialogComponent implements AfterViewInit {
  data = inject<{ options: Option[]; title: string }>(DIALOG_DATA);
  ref = inject(DialogRef<Option>);

  show = false;

  ngAfterViewInit(): void {
    timer(100).subscribe(() => (this.show = true));
  }
}
