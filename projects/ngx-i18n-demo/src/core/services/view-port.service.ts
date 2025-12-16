import { isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, inject, Injectable, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { BreakpointKey, SCREEN_WIDTH, ScreenWidthValue } from 'projects/ngx-i18n-demo/src/app/shared/enums/common.enum';

@Injectable({
  providedIn: 'root'
})
export class ViewPortService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  // 將 enum 轉成遞增清單：[['small',300], ...]
  private readonly breakpointList: Array<[BreakpointKey, number]> = (Object.keys(SCREEN_WIDTH) as BreakpointKey[])
    .map((key) => ([key, SCREEN_WIDTH[key as BreakpointKey]] as [BreakpointKey, number]))
    .sort((a, b) => a[1] - b[1]);
  private readonly _width = signal<number>(this.isBrowser() ? this.readWidth() : 0);
  private readonly _isCoarse = signal<boolean>(this.isBrowser() ? matchMedia('(pointer: coarse)').matches : false);

  readonly breakpointSig = computed<BreakpointKey>(() => this.widthToBreakpoint(this._width()));
  readonly isCoarseSig = this._isCoarse.asReadonly();

  readonly isMobileSig = signal<boolean>(false);
  readonly orientationSig = signal<ScreenOrientation | null>(null);


  constructor() {
    if (!this.isBrowser()) return;

    this.zone.runOutsideAngular(() => {
      const onResize = () => { this._width.set(this.readWidth()); this.isMobileSig.set(this.getIsMobile()) };
      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('orientationchange', () => { this.orientationSig.set(screen.orientation); this._width.set(this.readWidth()) }, { passive: true });
      window.visualViewport?.addEventListener('resize', onResize, { passive: true });
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        window.visualViewport?.removeEventListener('resize', onResize);
      });
      const mediaQueryList = matchMedia('(pointer: coarse)');
      const onMediaQueryList = (event: MediaQueryListEvent) => this._isCoarse.set(event.matches);
      this._isCoarse.set(mediaQueryList.matches);
      mediaQueryList.addEventListener('change', onMediaQueryList);
      this.destroyRef.onDestroy(() => {
        mediaQueryList.removeEventListener('change', onMediaQueryList);
      });
    })

    this.init()
  }


  /** 工具：是否 >= 指定斷點（依 enum 數值比較） */
  atLeast = (value: ScreenWidthValue): boolean =>
    this._width() >= value;

  /** 工具：是否 < 指定斷點 */
  lessThan = (value: ScreenWidthValue): boolean => {
    return this._width() < value;
  };

  // -- private methods -- //

  /** 取「值 <= w」中最大的（ 類似 min-width ） */
  private widthToBreakpoint(w: number): BreakpointKey {
    let result = this.breakpointList[0][0];

    for (const [key, width] of this.breakpointList) {
      console
      if (w >= width) {
        result = key;
      } else {
        break;
      }
    }
    return result;
  }

  private readWidth(): number {
    return window.innerWidth || document.documentElement.clientWidth || 0;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private init(): void {
    this.isMobileSig.set(this.getIsMobile());
    this.orientationSig.set(screen.orientation);
  }

  private getIsMobile(): boolean {
    return this.lessThan(SCREEN_WIDTH.xmedium)
  }

}
