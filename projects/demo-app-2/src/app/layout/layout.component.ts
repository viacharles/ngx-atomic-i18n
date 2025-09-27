import { AfterViewInit, Component, computed, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '@mini:shared//services/layout.service';
import { pageSlide } from '@mini:shared/animation-triggers/page.trigger';
import { PageDirectionModel } from '@mini:shared/models/page-direction.model';
import { ModulePath } from '@mini:shared/systems/router-system/route.enum';
import { ModulePathMap } from '@mini:shared/systems/router-system/route.map';
import { observeResize } from '@mini:shared/utils/resizeObserver.util';
import { RouterService } from '../../../core/services/router.service';
import { mainRoutes } from '../main.routes';
import { FootNavigationComponent } from './shared/components/foot-navigate/foot-navigation.component';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, FootNavigationComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  animations: [pageSlide],
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  mainElem = viewChild<ElementRef<HTMLElement>>('mainElem');
  title = signal('');
  bg = signal('');
  mainStyles = computed(() => ({
    y: this.layout$.isTop() ? 143 : 101,
    height: this.mainRect.sig()?.height,
  }));
  mainRect = {
    sig: signal<DOMRectReadOnly | null>(null),
    disconnect: () => {},
  };
  show = true;
  private readonly $router = inject(RouterService);
  pageDirection = new PageDirectionModel(this.$router.endUrl$, 1, 'layout');
  constructor(public layout$: LayoutService) {
    this.$router.endUrl$.subscribe((url) => {
      const mainSection = url.split('/')[2];
      const mached = mainRoutes[1].children?.filter((route) => route.path).find((route) => route.path === mainSection);
      this.title.set((mached?.title ?? '') as string);
      if (mached) {
        this.bg.set(ModulePathMap.get(mached.path! as ModulePath)!.bg);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.mainElem()) {
      this.mainRect.disconnect = observeResize(this.mainElem()!.nativeElement, (rect) => {
        this.mainRect.sig.set(rect);
      });
    }
  }

  ngOnDestroy(): void {
    this.pageDirection.subscribtion.unsubscribe();
    this.mainRect.disconnect();
  }
}
