import { Component } from '@angular/core';
import { OverviewPaths } from '@demo2-shared/enums/routes.enum';
import { provideTranslation, TranslationPipe } from 'ngx-atomic-i18n';
import { FormsModule } from '@angular/forms';
import { PageBase } from '@demo2-shared/base/page-base/page-base';
import { Option } from '@demo2-shared/interfaces/common.interface';
import { enumToOptions } from '@demo2-shared/utils/common.util';
import { Gender, Role } from './formatter.enum';
import { SelectComponent } from '@demo2-shared/systems/form-system/components/selects/select/select.component';

@Component({
  selector: 'app-formatter',
  standalone: true,
  imports: [TranslationPipe, FormsModule, SelectComponent],
  templateUrl: './formatter.component.html',
  styleUrl: './formatter.component.scss',
  providers: [provideTranslation('formatter')]
})
export class FormatterComponent extends PageBase {
  OverviewPaths = OverviewPaths;

  basicName = 'Alex';
  basicCount = 2;

  pluralCount = 1;

  selectKind: 'male' | 'female' | 'other' = 'female';

  exactCount = 0;

  nestedCount = 2;
  nestedRole: 'vip' | 'member' | 'guest' = 'vip';

  interpolationName = 'Mia';
  interpolationCount = 3;

  invalidCount = 2;

  missingName = '';
  missingCount = 2;

  genderOptions: Option[] = enumToOptions(Gender);
  roleOptions: Option[] = enumToOptions(Role);


  override onInit(): void {
    this.subscription.add(
      this.translationService.onLangChange.subscribe(() => {
        this.genderOptions = this.genderOptions.map(o => ({ ...o, name: this.translationService.t(o.value) })
        );
        this.roleOptions = this.roleOptions.map(o => ({ ...o, name: this.translationService.t(o.value) })
        );
      })
    )
  }
}
