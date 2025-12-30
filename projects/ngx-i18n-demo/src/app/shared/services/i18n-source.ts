import { Injectable } from '@angular/core';
import { MSG_TYPE } from '@demo2-shared/enums/common.enum';
import { ToastService } from '@demo2-shared/systems/toast-system/toast.service';
import { TranslationService } from 'ngx-atomic-i18n';
import { RouterService } from 'projects/ngx-i18n-demo/src/core/services/router.service';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class I18nSourceService {
  sources: Map<string, Map<string, Record<string, any>>> = new Map();
  namespaceCount = 0;
  constructor(
    public translateService: TranslationService,
    private routerService: RouterService,
    private toastService: ToastService,
  ) {
    this.routerService.endUrl$.pipe(delay(500)).subscribe(() => {
      const sourceLangNamespaces: string[] = [];
      this.sources.forEach((langMap, lang) => {
        langMap.forEach((_, namespace) => {
          sourceLangNamespaces.push(`${lang}:${namespace}`);
        })
      });
      this.namespaceCount = Array.from(this.translateService.getAllBundle().values()).reduce((sum, curMap) => sum + curMap.size, 0);
      this.translateService.getAllBundle().forEach((langMap, lang) => {
        langMap.forEach((_, namespace) => {
          if (sourceLangNamespaces.includes(`${lang}:${namespace}`)) return;
          this.toastService.open(MSG_TYPE.SUCCESS, this.translateService.t('載入翻譯', { lang, namespace }))
        })
      });

      this.sources = this.translateService.getAllBundle();
    });
  }
}
