import { Component } from '@angular/core';
import { PageBase } from '@demo2-shared/base/page-base/page-base';
import { CodeBlockComponent } from '@demo2-shared/components/code-block/code-block.component';
import { PluginPaths } from '@demo2-shared/enums/routes.enum';
import { provideTranslation, TranslationPipe } from 'ngx-atomic-i18n';

@Component({
  selector: 'app-emit-i18n-json-assets',
  standalone: true,
  imports: [CodeBlockComponent, TranslationPipe],
  templateUrl: './emit-i18n-json-assets.component.html',
  styleUrl: './emit-i18n-json-assets.component.scss',
  providers: [provideTranslation('emit-i18n-json-assets')]
})
export class EmitI18nJsonAssetsComponent extends PageBase {
  PluginPaths = PluginPaths;

}
