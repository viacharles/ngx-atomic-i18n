import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslationTestComponent } from './shared/components/translation-test/translation-test.component';
import { NgTemplateOutlet } from '@angular/common';
import { CodeBlockComponent } from './shared/components/code-block/code-block.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { provideTranslation, TranslationPipe, TranslationService } from '../../../ngx-i18n/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslationPipe, TranslationTestComponent, NgTemplateOutlet, CodeBlockComponent, ToastComponent],
  providers: [provideTranslation('common')],
  templateUrl: "./app.component.html",
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      color: #333;
    }

    .language-switcher {
      display: flex;
      gap: 0.5rem;
      background: #f5f5f5;
      padding: 0.25rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .lang-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      color: #666;
    }

    .lang-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .lang-btn.active {
      background: white;
      color: #333;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .lang-icon {
      font-size: 1.25rem;
    }

    .lang-text {
      font-weight: 500;
    }

    nav {
      cursor: pointer;
      display: flex;
      padding: 0 1rem;
    }

    nav a {
      color: #666;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    nav a:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #333;
    }

    main {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class AppComponent {
  currentLang?: string;
  code = {
    welcome: '<h1>{{ "welcome" | t }}</h1>'
  }

  constructor(
    public translationService: TranslationService,
    private router: Router,
  ) {
    // this.currentLang = this.translationService.currentLang;
  }

  onLanguageChange(lang: string): void {
    this.translationService.setLang(lang);
    this.currentLang = lang;
  }

  changeTab(tab: string): void {
    this.router.navigate([tab]);
  }
}
