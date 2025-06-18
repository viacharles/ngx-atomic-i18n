import { Component } from '@angular/core';
import { TranslationPipe } from 'ngx-atomic-i18n';
import { CodeBlockComponent } from '../../shared/components/code-block/code-block.component';
import { provideTranslation } from 'ngx-atomic-i18n/translate.util';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [TranslationPipe, CodeBlockComponent],
  providers: [provideTranslation('setting')],
  template: `
    <div class="home">
      <h2>{{ 'setting' | t }}</h2>
      <div>
      <p>{{ 'greeting' | t: { name: 'Home User' } }}</p>
      <app-code-block [code]="code.greeting" language="typescript"></app-code-block>
      </div>
      
      <p>{{ 'items' | t: { count: 1 } }}</p>
      <p>{{ 'items' | t: { count: 5 } }}</p>
      <p>{{ 'gender' | t: { gender: 'female' } }}</p>

      <app-code-block
        title="{{'範例程式碼' | t}}"
        language="typescript"
        [code]="exampleCode"
      ></app-code-block>
    </div>
  `,
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
    
zh-Hant =>  greeting: '你好，{{name}}！'
en => greeting: "Hello, {{name}}!",
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
  constructor() {
    console.log('aa-SettingComponent constructor')
  }
} 