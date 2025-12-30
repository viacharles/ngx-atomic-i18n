import { Router } from '@angular/router';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lang } from '@demo2-shared/enums/lang.enum';
import { enumToOptions } from '@demo2-shared/utils/common.util';
import { TranslationPipe, TranslationService } from 'ngx-atomic-i18n';
import { SelectComponent } from 'projects/ngx-i18n-demo/src/app/shared/systems/form-system/components/selects/select/select.component';
import { IconMenuComponent } from '@demo2-shared/components/icons/icon-menu/icon-menu.component';
import { IconButtonComponent } from '@demo2-shared/components/buttons/icon-button/icon-button.component';
import { DialogService } from '@demo2-shared/systems/dialog-system/dialog.service';
import { SideMenuPageDialogComponent } from './components/side-menu-page-dialog/side-menu-page-dialog.component';
import { IconGithubComponent } from '@demo2-shared/components/icons/icon-github/icon-github.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, SelectComponent, TranslationPipe, IconButtonComponent, IconMenuComponent, IconGithubComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly translateService = inject(TranslationService);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  isMobile = input<boolean>();
  langOptions = enumToOptions(Lang);
  currentLang = this.translateService.currentLang as Lang;

  changeLang(): void {
    const restPath = this.router.url.split('/').slice(2);
    this.translateService.setLang(this.currentLang);
    this.router.navigate(['/', this.currentLang, ...restPath]);
  }

  toggleMenu(): void {
    this.dialogService.open(SideMenuPageDialogComponent, {})
  }

  openGitHub(): void {
    window.open('https://github.com/viacharles/ngx-atomic-i18n', '_blank', 'noopener,noreferrer')
  }
}
