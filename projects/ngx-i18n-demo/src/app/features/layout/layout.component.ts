import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AnchorListService } from '@demo2-shared/systems/anchor-list/anchor-list.service';
import { AnchorListComponent } from '@demo2-shared/systems/anchor-list/anchor-list.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, SideNavComponent, FooterComponent, AnchorListComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  // animations: [pageSlide],
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  mainElem = viewChild<ElementRef<HTMLElement>>('mainElem');
  title = signal('');
  bg = signal('');
  show = true;

  constructor(
    public anchorService: AnchorListService
  ) {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }
}
