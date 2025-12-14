import { SelectComponent } from '../../../shared/systems/form-system/components/selects/select/select.component';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { PageBase } from '@demo2-shared/base/page-base/page-base';
import { CodeBlockComponent } from '@demo2-shared/components/code-block/code-block.component';
import { provideTranslation, TranslationPipe } from 'ngx-i18n';
import { ProjectArchitectureType } from '../get-start/shared/get-start.enum';
import { enumToOptions } from '@demo2-shared/utils/common.util';
import { ConfigurationText } from './shared/init-configuration.text';
import { FormsModule } from '@angular/forms';
import { LComponent } from '@demo2-shared/components/l/l.component';
import { OverviewPaths } from '@demo2-shared/enums/routes.enum';


@Component({
  selector: 'app-init-configuration',
  standalone: true,
  imports: [FormsModule, RouterModule, CodeBlockComponent, SelectComponent, LComponent, TranslationPipe],
  templateUrl: './init-configuration.component.html',
  styleUrl: './init-configuration.component.scss',
  providers: [provideTranslation('init-configuration')]
})
export class InitConfigurationComponent extends PageBase {
  structureOptions = enumToOptions(ProjectArchitectureType);
  structureSelectValue = null;
  structureText = '';

  OverviewPaths = OverviewPaths;

  constructor(
    private text: ConfigurationText
  ) { super() }

  changeStructure(value: ProjectArchitectureType): void {
    this.structureText = value === ProjectArchitectureType.Monorepo ? 'translationAssetsEx_1' : 'translationAssetsEx_2';
  }

}
