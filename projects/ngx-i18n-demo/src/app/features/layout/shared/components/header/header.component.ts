import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lang } from '@demo2-shared/enums/lang.enum';
import { enumToOptions } from '@demo2-shared/utils/common.util';
import { TranslationPipe, TranslationService } from 'ngx-i18n';
import { SelectComponent } from 'projects/ngx-i18n-demo/src/app/shared/systems/form-system/components/selects/select/select.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, SelectComponent, TranslationPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly translateService = inject(TranslationService);
  private readonly router = inject(Router);
  langOptions = enumToOptions(Lang);
  currentLang = this.translateService.currentLang as Lang;

  changeLang(): void {
    const restPath = this.router.url.split('/').slice(2);
    this.translateService.setLang(this.currentLang);
    this.router.navigate(['/', this.currentLang, ...restPath]);
  }
}
