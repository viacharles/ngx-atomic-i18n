import { Component } from '@angular/core';
import { TranslationPipe } from '../../../../../ngx-atomic-i18n/src/public-api';

@Component({
  selector: 'app-lazy',
  standalone: true,
  imports: [TranslationPipe],
  template: `
    <div class="lazy-component">
      <h2>{{ 'lazy' | t }}</h2>
      <p>{{ 'greeting' | t: { name: 'Lazy User' } }}</p>
    </div>
  `,
  styles: [`
    .lazy-component {
      padding: 2rem;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
  `]
})
export class LazyComponent { }
