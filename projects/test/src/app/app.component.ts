import { Component } from '@angular/core';
import { TranslationPipe } from 'ngx-atomic-i18n';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranslationPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'test';
}
