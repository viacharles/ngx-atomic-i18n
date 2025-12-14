import { Component } from '@angular/core';
import { PageBase } from '@demo2-shared/base/page-base/page-base';
import { CodeBlockComponent } from '@demo2-shared/components/code-block/code-block.component';
import { OverviewPaths } from '@demo2-shared/enums/routes.enum';
import { provideTranslation, TranslationPipe } from 'ngx-i18n';

@Component({
  selector: 'app-comp-configuration',
  standalone: true,
  imports: [TranslationPipe, CodeBlockComponent],
  templateUrl: './comp-configuration.component.html',
  styleUrl: './comp-configuration.component.scss',
  providers: [provideTranslation('comp-configuration')]
})
export class CompConfigurationComponent extends PageBase {
  OverviewPaths = OverviewPaths;
  constructor() { super() }

}
