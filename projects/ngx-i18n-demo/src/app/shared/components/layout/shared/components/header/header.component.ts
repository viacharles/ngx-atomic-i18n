import { Component, inject } from '@angular/core';
import { Lang } from '@demo2-shared/enums/lang.enum';
import { CommonService } from '@demo2-shared/services/common.service';
import { TranslationPipe } from 'ngx-i18n';
import { SelectComponent } from 'projects/ngx-i18n-demo/src/app/shared/systems/form-system/components/selects/select/select.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SelectComponent, TranslationPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly commonService = inject(CommonService);
  langOptions = this.commonService.enumToOptions(Lang);
}
