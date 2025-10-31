import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { ThemeType } from '../types/theme.type';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { StoreObjectName } from '../types/indexedDB.type';
import { SessionStorageName } from '../types/sessionStorage.type';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly platFormId = inject<Object>(PLATFORM_ID);

  private theme = signal<ThemeType>(ThemeType.LIGHT);
  private isBrowser: boolean = isPlatformBrowser(this.platFormId);
  private readonly attrName = SessionStorageName.DataTheme;

  constructor(
  ) {
    effect(() => {
      this.toggleTheme(this.theme());
    })
  }

  setTheme(theme: ThemeType): void {
    console.log('aa-setTheme', theme, this.isBrowser);
    if (!this.isBrowser) return;
    sessionStorage.setItem(StoreObjectName.DataTheme, theme);
    this.toggleTheme(theme);
  }


  private toggleTheme(theme: ThemeType): void {
    if (!this.isBrowser) return;
    const rootElem = this.doc.documentElement;
    if (theme === ThemeType.SYSTEM) {
      rootElem.removeAttribute('');
      rootElem.style.colorScheme = '';
      this.setColorScheme(matchMedia('(prefer-color-scheme: dark)').matches ? ThemeType.DARK : ThemeType.LIGHT);
    } else {
      rootElem.setAttribute(this.attrName, theme);
      this.setColorScheme(theme);
    }
  }

  private setColorScheme(theme: ThemeType): void {
    if (!this.isBrowser) return;
    this.doc.documentElement.style.colorScheme = theme;
  }
}
