import { isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, inject, Injectable, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { BreakpointKey, SCREEN_WIDTH } from 'projects/ngx-i18n-demo/src/app/shared/enums/common.enum';

@Injectable({
  providedIn: 'root'
})
export class ViewPortService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  // 將 enum 轉成遞增清單：[['small',300], ...]
  private readonly breakpointList: Array<[BreakpointKey, number]> = Object.keys(SCREEN_WIDTH)
    .map((key) => ([key, SCREEN_WIDTH[key as BreakpointKey]] as [BreakpointKey, number]))
    .sort((a, b) => a[1] - b[1]);
  private readonly _width = signal<number>(this.isBrowser() ? this.readWidth() : 0);
  private readonly _isCoarse = signal<boolean>(this.isBrowser() ? matchMedia('(pointer: coarse)').matches : false);

  readonly breakpoint = computed<BreakpointKey>(() => this.widthToBreakpoint(this._width()));
  readonly isCoarse = this._isCoarse.asReadonly();

  constructor() {
    if (!this.isBrowser()) return;

    this.zone.runOutsideAngular(() => {
      const onResize = () => this._width.set(this.readWidth());
      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('orientationchange', onResize, { passive: true });
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
  }

  /** 工具：是否 >= 指定斷點（依 enum 數值比較） */
  atLeast = (value: SCREEN_WIDTH): boolean =>
    SCREEN_WIDTH[this.breakpoint()] >= value;

  /** 工具：是否 < 指定斷點 */
  lessThan = (value: SCREEN_WIDTH): boolean =>
    SCREEN_WIDTH[this.breakpoint()] < value;

  // -- private methods -- //

  /** 取「值 <= w」中最大的（ 類似 min-width ） */
  private widthToBreakpoint(w: number): BreakpointKey {
    let result = this.breakpointList[0][0];
    for (const [key, width] of this.breakpointList) {
      if (w >= width) {
        result = key;
      } else {
        break;
      }
    }
    return result;
  }

  private readWidth(): number {
    const view = window.visualViewport;
    if (view && typeof view.width === 'number') Math.round(view.width);
    const docWidth = document.documentElement?.clientWidth || 0;
    const winWidth = window.innerWidth || 0;
    return Math.max(docWidth, winWidth);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

}
