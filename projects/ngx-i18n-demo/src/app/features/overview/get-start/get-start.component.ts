import { Component, Injector, OnInit } from '@angular/core';
import { provideTranslation, TranslationPipe } from 'ngx-atomic-i18n';
import { DialogService } from '@demo2-shared/systems/dialog-system/dialog.service';
import { SelectComponent } from '@demo2-shared/systems/form-system/components/selects/select/select.component';
import { Option } from '@demo2-shared/interfaces/common.interface';
import { AppBootstrapMode, LazyLoadType, ProjectArchitectureType, RenderType } from './shared/get-start.enum';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SetUpConfigForm } from './shared/get-start.type';
import { StoreObjectName } from 'projects/ngx-i18n-demo/src/core/types/indexedDB.type';
import { CodeBlockComponent } from '@demo2-shared/components/code-block/code-block.component';
import { IconStarComponent } from '@demo2-shared/icons/icon-star/icon-star.component';
import { GetStartText } from './shared/get-start.text';
import { PageBase } from '@demo2-shared/base/page-base/page-base';
import { enumToOptions } from '@demo2-shared/utils/common.util';


@Component({
  selector: 'app-get-start',
  standalone: true,
  imports: [ReactiveFormsModule, CodeBlockComponent, TranslationPipe, SelectComponent, IconStarComponent],
  providers: [provideTranslation('get-start', true)],
  templateUrl: './get-start.component.html',
  styleUrl: './get-start.component.scss'
})
export class GetStartComponent extends PageBase implements OnInit {

  // form
  configForm = new FormGroup<SetUpConfigForm>({
    renderType: new FormControl(null, [Validators.required]),
    projectArchitecture: new FormControl(null, [Validators.required]),
    appBootstrapMode: new FormControl(null, [Validators.required]),
  })
  lazyLoadControl = new FormControl<LazyLoadType | null>(null, [Validators.required]);

  // options
  renderTypeOptions: Option[] = enumToOptions(RenderType);
  projectArchitectureTypeOptions: Option[] = enumToOptions(ProjectArchitectureType);
  appBootstrapModeOptions: Option[] = enumToOptions(AppBootstrapMode);
  lazyLoadOptions: Option[] = enumToOptions(LazyLoadType);

  text = new GetStartText(this.translationService);

  // get
  get isCSR(): boolean { return this.configForm?.value['renderType'] === RenderType['CSR (一般選這個)'] };
  get isStandalone(): boolean { return this.configForm.value['appBootstrapMode'] === AppBootstrapMode['Standalone (app.config.ts)'] };
  get isMonorepo(): boolean { return this.configForm.value['projectArchitecture'] === ProjectArchitectureType.Monorepo }


  constructor(
    private dialogService: DialogService,
    private injector: Injector
  ) {
    super()
  }

  override onInit(): void {
    this.subscription.add(
      this.translationService.onLangChange.subscribe(lang => {
        this.text.initConfig.set(this.isStandalone ? this.text.getConfigStandalone(this.isCSR, this.isMonorepo) : this.text.getConfigModule(this.isCSR, this.isMonorepo));
        this.handleLazyLoadTranslate(this.lazyLoadControl.value);
      })
    );
    this.handleAndSubscribeSetupOption();
    this.subscribeLazyLoadOption();
  }

  private handleAndSubscribeSetupOption(): void {
    const appBootstrapMode = (this.isBrowser ? sessionStorage.getItem(StoreObjectName.AppBootstrapMode) : this.isStandalone) as AppBootstrapMode;
    const projectArchitecture = (this.isBrowser ? sessionStorage.getItem(StoreObjectName.ProjectArchitectureType) : this.isMonorepo) as ProjectArchitectureType;
    const renderType = (this.isBrowser ? sessionStorage.getItem(StoreObjectName.RenderType) : this.isCSR) as RenderType;

    this.subscription.add(
      this.configForm.valueChanges.subscribe(value => {
        if (value.appBootstrapMode) {
          sessionStorage.setItem(StoreObjectName.AppBootstrapMode, value.appBootstrapMode);
        }
        if (value.projectArchitecture) {
          sessionStorage.setItem(StoreObjectName.ProjectArchitectureType, value.projectArchitecture);
        }
        if (value.renderType) {
          sessionStorage.setItem(StoreObjectName.RenderType, value.renderType);
        }
        this.text.initConfig.set(this.isStandalone ? this.text.getConfigStandalone(this.isCSR, this.isMonorepo) : this.text.getConfigModule(this.isCSR, this.isMonorepo));
      })
    );
    this.configForm.patchValue({ appBootstrapMode, projectArchitecture, renderType }, { emitEvent: true });
  }

  private subscribeLazyLoadOption(): void {
    this.subscription.add(
      this.lazyLoadControl.valueChanges.subscribe(value => {
        this.handleLazyLoadTranslate(value);
      })
    )
  }

  private handleLazyLoadTranslate(value: LazyLoadType | null): void {
    let key: string | null = null;
    switch (value) {
      case LazyLoadType['NgModule (元件)']:
        key = this.text.lazyLoad.ModuleComp; break;
      case LazyLoadType['NgModule (模組)']:
        key = this.text.lazyLoad.ModuleModule; break;
      case LazyLoadType['Standalone (元件)']:
        key = this.text.lazyLoad.CompComp; break;
      default:
        key = ''; break;
    }
    this.text.sourceLoadProvider.set(key ? this.translationService.t(key) : '');
  }

  openDescribeDialog(describe: string): void {
    this.dialogService.openDescribe(describe, undefined, this.injector)
  }

}
