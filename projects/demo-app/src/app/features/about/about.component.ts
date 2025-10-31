import { Component } from '@angular/core';
import { TranslationPipe } from '../../../../../ngx-i18n/src/public-api';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslationPipe],
  template: `
    <div class="about">
      <h2>{{ 'about' | t }}</h2>
      <p>{{ 'greeting' | t: { name: 'About User' } }}</p>
      <p>{{ 'items' | t: { count: 2 } }}</p>
      <p>{{ 'gender' | t: { gender: 'other' } }}</p>
    </div>
  `,
  styles: [`
    .about {
      padding: 2rem;
      background-color: #f3e5f5;
      border-radius: 8px;
    }
  `]
})
export class AboutComponent { }
