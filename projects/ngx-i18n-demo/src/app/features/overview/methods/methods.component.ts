import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBase } from '@demo2-shared/base/page-base/page-base';
import { FeaturePaths, OverviewPaths } from '@demo2-shared/enums/routes.enum';
import { provideTranslation, TranslationPipe } from 'ngx-i18n';

@Component({
  selector: 'app-methods',
  standalone: true,
  imports: [RouterModule, TranslationPipe,],
  templateUrl: './methods.component.html',
  styleUrl: './methods.component.scss',
  providers: [provideTranslation('methods', true)]
})
export class MethodsComponent extends PageBase {
  FeaturePaths = FeaturePaths;
  OverviewPaths = OverviewPaths;
  constructor() {
    super()
  }

}
