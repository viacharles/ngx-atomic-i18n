import { RouterService } from './../../../../core/services/router.service';
import { DestroyRef, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AnchorListItem } from './anchor-list.type';
import { Router, Scroll } from '@angular/router';
import { filter, timer } from 'rxjs';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AnchorListService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private destroyRef = inject(DestroyRef);
  private viewportScroller = inject(ViewportScroller);

  currentUrl: string = '';

  constructor(private router: Router, private routerService: RouterService) {
    this, this.viewportScroller.setOffset([0, 95]);
    this.router.events.pipe(filter(e => e instanceof Scroll)).subscribe(e => {
      if (!this.isBrowser) return;
      if (e.position) {
        this.viewportScroller.scrollToPosition(e.position);
      }
      if (e.anchor) {
        this.viewportScroller.scrollToAnchor(e.anchor);
      }
      this.viewportScroller.scrollToPosition([0, 0]);
    });
    this.routerService.endUrl$.subscribe(url => {
      this.currentUrl = url.split('#')[0];
    })
  }

  list: AnchorListItem[] = [];

  navigateToAnchor(anchor: string): void {
    // const url = this.router.url.split('#')[0];
    // this.router.navigate([url], {
    //   fragment: anchor,
    //   queryParamsHandling: 'merge'
    // });
  }

  setList(container?: HTMLElement | null): Promise<void> {
    return new Promise(resolve => {
      timer(0).subscribe(() => {
        this.list = this.getList(container)
        resolve();
      });
    })
  }

  /**
     * 只有雙層
     * Collects page headings (`<h2 class="title">`/`<h3 class="subTitle">`) and builds a hierarchical anchor list.
     */
  getList(container?: HTMLElement | null): AnchorListItem[] {
    if (!this.isBrowser) return [];
    const host = container;
    if (!host) {
      this.list = [];
      return this.list;
    }
    const sections = Array.from(host.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.tagName.toLowerCase() === 'section'
    );
    const anchors = sections
      .map((section, index) => {
        const heading = this.findHeading(section, 'h2', 'title');
        if (!heading) {
          return null;
        }
        const children = this.collectSubtitles(section, index);
        return {
          title: heading.textContent?.trim() ?? '',
          id: heading.id,
          list: children,
        } as AnchorListItem;
      })
      .filter((item): item is AnchorListItem => !!item && !!item.title);
    anchors;
    return anchors;
  }
  private collectSubtitles(section: HTMLElement, parentIndex: number): AnchorListItem[] {
    const subtitles = Array.from(section.querySelectorAll('h3.subTitle'));
    return subtitles
      .filter((sub) => {
        const title = sub.textContent?.trim();
        return !!title && !!title.length
      })
      .map(sub => ({ title: sub.textContent?.trim() ?? '', list: [], id: sub.id }));
  }
  private findHeading(section: HTMLElement, tagName: string, className: string): HTMLElement | null {
    for (const child of Array.from(section.children)) {
      if (child instanceof HTMLElement && child.tagName.toLowerCase() === tagName.toLowerCase() && child.classList.contains(className)) {
        return child;
      }
    }
    return null;
  }
}
