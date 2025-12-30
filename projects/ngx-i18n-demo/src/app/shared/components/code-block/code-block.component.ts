import { ChangeDetectionStrategy, Component, effect, input, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { TranslationPipe } from 'ngx-atomic-i18n';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule, TranslationPipe],
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockComponent {
  code = input('');
  @Input() language = 'typescript';
  @Input() title = '';
  @Input() hasExpandBtn: boolean | null = null;

  toggleExpand: boolean = false;
  highlightedCode = signal('');
  copied = signal(false);

  constructor() {
    effect(() => {
      this.highlightedCode.set(hljs.highlight(this.code(), { language: this.language }).value);
    })
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }
}
