import { IconButtonComponent } from '@demo2-shared/components/buttons/icon-button/icon-button.component';

import { Component, signal } from '@angular/core';
import { IconMoonComponent } from "@demo2-shared/components/icons/icon-moon/icon-moon.component";
import { IconScreenComponent } from '@demo2-shared/components/icons/icon-screen/icon-screen.component';
import { IconSunComponent } from '@demo2-shared/components/icons/icon-sun/icon-sun.component';
import { ThemeService } from 'projects/ngx-i18n-demo/src/core/services/theme.service';
import { ThemeType } from 'projects/ngx-i18n-demo/src/core/types/theme.type';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IconMoonComponent, IconSunComponent, IconScreenComponent, IconButtonComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentTheme = signal<ThemeType | null>(null);
  ThemeType = ThemeType;

  constructor(
    public themeService: ThemeService
  ) { }
  setTheme(theme: ThemeType): void {
    this.themeService.setTheme(theme);
    this.currentTheme.set(theme);
  }
}
