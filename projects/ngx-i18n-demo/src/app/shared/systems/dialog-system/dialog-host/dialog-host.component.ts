import { AfterViewInit, Component, inject, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogModel } from '../dialog.model';
import { DialogService } from '../dialog.service';
import { DialogPortalComponent } from './dialog-portal/dialog-portal.component';
export interface DialogComponentWithAnimation extends Type<any> {
  animationTrigger?: string;
}
@Component({
  selector: 'app-dialog-host',
  imports: [DialogPortalComponent],
  templateUrl: './dialog-host.component.html',
  styleUrl: './dialog-host.component.scss',
  standalone: true,
  // animations: [dialogtrigger],
})
export class DialogHostComponent implements AfterViewInit {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  host = inject(DialogService).list;

  constructor(
    private readonly dialogService: DialogService,
  ) { }

  ngAfterViewInit(): void {
    this.dialogService.hostRef = this.container;
    if (this.dialogService.hostRef) {
      this.dialogService.runPendingDialogs();
    }
  }

  backdropClick(dialog: DialogModel<any, any>): void {
    if (dialog.config?.closeOnBackdropClick === true) {
      dialog.close();
    }
  }

}
