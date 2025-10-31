import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.scss']
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
