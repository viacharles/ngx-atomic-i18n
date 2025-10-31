import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, SideNavComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  // animations: [pageSlide],
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  mainElem = viewChild<ElementRef<HTMLElement>>('mainElem');
  title = signal('');
  bg = signal('');
  // mainStyles = computed(() => ({
  //   y: this.layout$.isTop() ? 143 : 101,
  //   height: this.mainRect.sig()?.height,
  // }));
  mainRect = {
    sig: signal<DOMRectReadOnly | null>(null),
    disconnect: () => { },
  };
  show = true;
  // private readonly $router = inject(RouterService);
  // pageDirection = new PageDirectionModel(this.$router.endUrl$, 1, 'layout');
  constructor(
    // public layout$: LayoutService
  ) {
    // this.$router.endUrl$.subscribe((url) => {
    //   const mainSection = url.split('/')[2];
    //   const mached = mainRoutes[1].children?.filter((route) => route.path).find((route) => route.path === mainSection);
    //   this.title.set((mached?.title ?? '') as string);
    //   if (mached) {
    //     this.bg.set(ModulePathMap.get(mached.path! as ModulePath)!.bg);
    //   }
    // });
  }

  ngAfterViewInit(): void {
    console.log('aa-layout')
    if (this.mainElem()) {
      // this.mainRect.disconnect = observeResize(this.mainElem()!.nativeElement, (rect) => {
      //   this.mainRect.sig.set(rect);
      // });
    }
  }

  ngOnDestroy(): void {
    // this.pageDirection.subscribtion.unsubscribe();
    this.mainRect.disconnect();
  }
}
