import { Component } from '@angular/core';
import { TranslationPipe } from '../../../../../../ngx-atomic-i18n/src/public-api';

@Component({
  selector: 'app-translation-test',
  standalone: true,
  imports: [TranslationPipe],
  template: `
    <div class="translation-test">
      <h3>{{ 'template.title' | t }}</h3>
      <p>{{ 'template.content' | t }}</p>
      <p>{{ 'greeting' | t: { name: 'World' } }}</p>
      <p>{{ 'items' | t: { count: 1 } }}</p>
      <p>{{ 'items' | t: { count: 5 } }}</p>
      <p>{{ 'gender' | t: { gender: 'male' } }}</p>
    </div>
  `,
  styles: [`
    .translation-test {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin: 1rem 0;
    }
  `]
})
export class TranslationTestComponent {
}
