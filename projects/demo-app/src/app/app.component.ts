import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TRANSLATION_CONTEXT, TranslationService } from 'ngx-atomic-i18n';
import { TranslationPipe } from 'ngx-atomic-i18n';
import { TranslationTestComponent } from './shared/components/translation-test/translation-test.component';
import { NgTemplateOutlet } from '@angular/common';
import { CodeBlockComponent } from './shared/components/code-block/code-block.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { provideTranslation } from 'ngx-atomic-i18n/translate.util';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslationPipe, TranslationTestComponent, NgTemplateOutlet, CodeBlockComponent, ToastComponent],
  providers: [provideTranslation('common')],
  template: `
  @if (ctx.ready?.()) {
    <div class="app-container">
      <header>
        <div>
        <h1>{{ 'welcome' | t }}</h1>
        <app-code-block [code]="code.welcome"  language="typescript"></app-code-block>
        </div>
        <div class="language-switcher">
          <button 
            [class.active]="currentLang === 'en'" 
            (click)="onLanguageChange('en')"
            class="lang-btn"
          >
            <span class="lang-icon">🇺🇸</span>
            <span class="lang-text">English</span>
          </button>
          <button 
            [class.active]="currentLang === 'zh-Hant'" 
            (click)="onLanguageChange('zh-Hant')"
            class="lang-btn"
          >
            <span class="lang-icon">🇹🇼</span>
            <span class="lang-text">繁體中文</span>
          </button>
        </div>
      </header>

      <nav>
        <a (click)="changeTab('')">{{ 'setting' | t }}</a>
        <a  (click)="changeTab('about')">{{ 'about' | t }}</a>
        <a (click)="changeTab('lazy')">{{ 'lazy' | t }}</a>
      </nav>

      <main>
        <router-outlet></router-outlet>
        <ng-container *ngTemplateOutlet="testTemplate"></ng-container>
      </main>
    </div>

    <ng-template #testTemplate>
      <app-translation-test></app-translation-test>
    </ng-template>

    <app-toast></app-toast>
  }

  `,
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

  ctx = inject(TRANSLATION_CONTEXT);
  constructor(
    private translationService: TranslationService,
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
