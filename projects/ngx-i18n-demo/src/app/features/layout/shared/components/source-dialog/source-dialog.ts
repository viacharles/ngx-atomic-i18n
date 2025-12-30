import { KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IconCrossComponent } from '@demo2-shared/components/icons/icon-cross/icon-cross.component';
import { MSG_TYPE } from '@demo2-shared/enums/common.enum';
import { I18nSourceService } from '@demo2-shared/services/i18n-source';
import { DialogModel } from '@demo2-shared/systems/dialog-system/dialog.model';
import { ToastService } from '@demo2-shared/systems/toast-system/toast.service';
import { TranslationPipe, TranslationService } from 'ngx-atomic-i18n';

@Component({
  selector: 'app-source-dialog',
  imports: [KeyValuePipe, TranslationPipe, IconCrossComponent],
  templateUrl: './source-dialog.html',
  styleUrl: './source-dialog.scss',
  providers: [
  ]
})
export class SourceDialogComponent {
  readonly i18nSourceService = inject(I18nSourceService);
  readonly translationService = inject(TranslationService);
  readonly toastService = inject(ToastService);
  readonly dialogRef = inject(DialogModel)

  removeTranslation(lang: string, namespace: string): void {
    this.translationService.removeResourceBundle(lang, namespace);
    this.toastService.open(MSG_TYPE.WARNING, this.translationService.t('刪除翻譯', { lang, namespace }))
    this.toastService.open(MSG_TYPE.SUCCESS, this.translationService.t('載入翻譯', { lang, namespace }))
  }
}
