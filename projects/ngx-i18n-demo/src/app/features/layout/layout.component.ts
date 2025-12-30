import { I18nSourceService } from '@demo2-shared/services/i18n-source';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AnchorListService } from '@demo2-shared/systems/anchor-list/anchor-list.service';
import { AnchorListComponent } from '@demo2-shared/systems/anchor-list/anchor-list.component';
import { ViewPortService } from 'projects/ngx-i18n-demo/src/core/services/view-port.service';
import { IconListLeftComponent } from '@demo2-shared/components/icons/icon-list-left/icon-list-left.component';
import { IconButtonComponent } from '@demo2-shared/components/buttons/icon-button/icon-button.component';
import { DialogService } from '@demo2-shared/systems/dialog-system/dialog.service';
import { SourceDialogComponent } from './shared/components/source-dialog/source-dialog';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, SideNavComponent, FooterComponent, AnchorListComponent, IconButtonComponent, IconListLeftComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  // animations: [pageSlide],
})
export class LayoutComponent {
  readonly viewportService = inject(ViewPortService);
  mainElem = viewChild<ElementRef<HTMLElement>>('mainElem');
  title = signal('');
  bg = signal('');

  constructor(
    public anchorService: AnchorListService,
    public i18nSourceService: I18nSourceService,
    private dialogService: DialogService,
  ) {
  }

  openSourceDialog(): void {
    this.dialogService.open(SourceDialogComponent, {})
  }
}
