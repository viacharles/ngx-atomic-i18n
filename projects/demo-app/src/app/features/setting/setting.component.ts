import { Component } from '@angular/core';
import { CodeBlockComponent } from '../../shared/components/code-block/code-block.component';
import { provideTranslation, TranslationPipe, TranslationService } from '../../../../../ngx-atomic-i18n/src/public-api';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [TranslationPipe, CodeBlockComponent],
  providers: [provideTranslation('setting')],
  templateUrl: './setting.component.html',
  styles: [`
    .home {
      padding: 2rem;
      background-color: #e3f2fd;
      border-radius: 8px;
    }
  `]
})
export class SettingComponent {
  code = {
    greeting: `<p>{{ 'greeting' | t: { name: 'Home User' } }}</p>

// zh-Hant =>  greeting: '你好，{{name}}！'
// en => greeting: "Hello, {{name}}!",
`,
  }
  exampleCode = `import { Component } from '@angular/core';
import { TranslationPipe } from 'ngx-atomic-i18n';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TranslationPipe],
  template: \`
    <div>
      <p>{{ 'greeting' | t: { name: 'World' } }}</p>
      <p>{{ 'items' | t: { count: 1 } }}</p>
      <p>{{ 'gender' | t: { gender: 'male' } }}</p>
    </div>
  \`
})
export class ExampleComponent {}`;
  constructor(
    public translationService: TranslationService,
  ) {
  }
}
