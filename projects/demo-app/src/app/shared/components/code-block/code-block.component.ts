import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

@Component({
    selector: 'app-code-block',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="code-block">
      <div class="code-header" *ngIf="title">
        <div class="header-left">
          <span class="title">{{ title }}</span>
          <div class="language-selector">
            <select [value]="language" (change)="onLanguageChange($event)">
              <option *ngFor="let lang of availableLanguages" [value]="lang.value">
                {{ lang.label }}
              </option>
            </select>
            <div class="language-icon">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
            </div>
          </div>
        </div>
        <button class="copy-btn" (click)="copyCode()">
          {{ copied ? '已複製' : '複製' }}
        </button>
      </div>
      <pre><code [class]="language" [innerHTML]="highlightedCode"></code></pre>
    </div>
  `,
    styles: [`
    .code-block {
      background: #282c34;
      border-radius: 8px;
      margin: 1rem 0;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title {
      font-size: 0.875rem;
      color: #abb2bf;
    }

    .language-selector {
      position: relative;
      display: flex;
      align-items: center;
    }

    .language-icon {
      position: absolute;
      left: 0.5rem;
      color: #abb2bf;
      pointer-events: none;
      display: flex;
      align-items: center;
    }

    .language-selector select {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 0.25rem 2rem 0.25rem 2rem;
      font-size: 0.75rem;
      color: #abb2bf;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23abb2bf' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      transition: all 0.2s ease;
      min-width: 120px;
    }

    .language-selector select:hover {
      background-color: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .language-selector select:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      color: #abb2bf;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    pre {
      margin: 0;
      padding: 1rem;
      overflow-x: auto;
    }

    code {
      font-size: 0.875rem;
      line-height: 1.5;
      color: #abb2bf;
    }

    /* 自定義 highlight.js 主題顏色 */
    :host ::ng-deep {
      .hljs {
        background: #282c34;
        color: #abb2bf;
      }

      .hljs-keyword,
      .hljs-selector-tag,
      .hljs-literal,
      .hljs-name,
      .hljs-strong {
        color: #c678dd;
      }

      .hljs-string,
      .hljs-doctag {
        color: #98c379;
      }

      .hljs-title,
      .hljs-section,
      .hljs-selector-id {
        color: #e06c75;
      }

      .hljs-type,
      .hljs-class .hljs-title {
        color: #e5c07b;
      }

      .hljs-tag,
      .hljs-name,
      .hljs-attribute {
        color: #61afef;
      }

      .hljs-regexp,
      .hljs-link {
        color: #56b6c2;
      }

      .hljs-symbol,
      .hljs-bullet {
        color: #56b6c2;
      }

      .hljs-built_in,
      .hljs-builtin-name {
        color: #e06c75;
      }

      .hljs-meta {
        color: #5c6370;
        font-style: italic;
      }

      .hljs-deletion {
        background: #e06c75;
      }

      .hljs-addition {
        background: #98c379;
      }

      .hljs-emphasis {
        font-style: italic;
      }

      .hljs-strong {
        font-weight: bold;
      }
    }
  `]
})
export class CodeBlockComponent {
    @Input() code = '';
    @Input() language = 'typescript';
    @Input() title = '';

    private _highlightedCode = '';
    copied = false;

    availableLanguages = [
        { value: 'typescript', label: 'TypeScript' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'bash', label: 'Bash' },
        { value: 'shell', label: 'Shell' },
        { value: 'yaml', label: 'YAML' }
    ];

    get highlightedCode(): string {
        if (!this._highlightedCode) {
            this._highlightedCode = hljs.highlight(this.code, { language: this.language }).value;
        }
        return this._highlightedCode;
    }

    onLanguageChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.language = select.value;
        this._highlightedCode = ''; // 清除快取，強制重新高亮
        this.highlightedCode; // 觸發重新高亮
    }

    async copyCode(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.code);
            this.copied = true;
            setTimeout(() => {
                this.copied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    }
} 