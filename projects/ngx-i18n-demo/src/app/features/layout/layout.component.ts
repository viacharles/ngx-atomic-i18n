import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AnchorListService } from '@demo2-shared/systems/anchor-list/anchor-list.service';
import { AnchorListComponent } from '@demo2-shared/systems/anchor-list/anchor-list.component';
import { ViewPortService } from 'projects/ngx-i18n-demo/src/core/services/view-port.service';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, SideNavComponent, FooterComponent, AnchorListComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  // animations: [pageSlide],
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  readonly viewportService = inject(ViewPortService);
  mainElem = viewChild<ElementRef<HTMLElement>>('mainElem');
  title = signal('');
  bg = signal('');

  constructor(
    public anchorService: AnchorListService
  ) {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }
}
