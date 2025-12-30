import { Component, inject, input, OnInit } from '@angular/core';
import { Toast } from '../toast.type';
import { TranslationPipe } from 'ngx-atomic-i18n';
import { IconCrossComponent } from '@demo2-shared/components/icons/icon-cross/icon-cross.component';
import { ToastService } from '../toast.service';
import { MSG_TYPE } from '@demo2-shared/enums/common.enum';

@Component({
  selector: 'app-toast',
  imports: [TranslationPipe, IconCrossComponent],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent implements OnInit {
  toast = input<Toast | undefined>();
  toastService = inject(ToastService);

  ngOnInit(): void {
    const duration = this.toast()?.type === MSG_TYPE.SUCCESS
      ? 3000 : this.toast()?.type === MSG_TYPE.INFO
        ? 3000 : this.toast()?.type === MSG_TYPE.WARNING
          ? 3000 : 1500;
    if (this.toast()?.type !== MSG_TYPE.ERROR) {
      setTimeout(() => this.toastService.close(this.toast()?.id ?? ''), duration)
    }

  }
}
