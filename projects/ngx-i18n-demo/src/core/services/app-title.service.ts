import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationService } from 'ngx-atomic-i18n';

@Injectable({
  providedIn: 'root'
})
export class AppTitleService extends TitleStrategy {
  private latestSnapshot?: RouterStateSnapshot;

  constructor(
    private title: Title,
    private translationService: TranslationService,
  ) {
    super();
    this.translationService.onLangChange.subscribe(() => {
      if (this.latestSnapshot) {
        this.handleTitle(this.latestSnapshot);
      }
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.latestSnapshot = snapshot;
    this.handleTitle(snapshot);
  }

  private handleTitle(snapshot: RouterStateSnapshot): void {
    const title = this.translationService.t(this.buildTitle(snapshot) ?? '');
    if (title) {
      this.title.setTitle(`${title} | ngx-atomic-i18n`);
    } else {
      this.title.setTitle(`ngx-atomic-i18n`);
    }
  }
}
