import { AfterViewInit, Component, inject, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogModel } from '../dialog.model';
import { DialogService } from '../dialog.service';
import { DialogPortalComponent } from './dialog-portal/dialog-portal.component';
import { JsonPipe } from '@angular/common';
export interface DialogComponentWithAnimation extends Type<any> {
  animationTrigger?: string;
}
@Component({
  selector: 'app-dialog-host',
  imports: [DialogPortalComponent, JsonPipe],
  templateUrl: './dialog-host.component.html',
  styleUrl: './dialog-host.component.scss',
  standalone: true,
  // animations: [dialogtrigger],
})
export class DialogHostComponent implements AfterViewInit {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  host = inject(DialogService).list;

  constructor(
    private readonly dialogService: DialogService,
  ) { }

  ngAfterViewInit(): void {
    this.dialogService.hostRef = this.container;
    if (this.dialogService.hostRef) {
      this.dialogService.runPendingDialogs();
    }
  }

  // typeTemp(dialog: DialogModel<any, any>): TemplateRef<unknown> {
  //   return dialog.content as TemplateRef<unknown>;
  // }
  // typeComponent(dialog: DialogModel<any, any>): any {
  //   return dialog.content;
  // }
  backdropClick(dialog: DialogModel<any, any>): void {
    if (dialog.config?.closeOnBackdropClick === true) {
      dialog.close();
    }
  }
  // isTemplate(dialog: DialogModel<any, any>): boolean {
  //   return dialog.content instanceof TemplateRef;
  // }

  // getAnimation(dialog: DialogModel<any, any>): string {
  //   const animationTrigger = (dialog.instance as DialogComponentWithAnimation)?.animationTrigger;
  //   return animationTrigger ?? '';
  // }

  // attachComponent(instance: DialogModel<any, any>) {
  //   const injector = this.createDialogInjector(instance);
  //   const ref = this.container.createComponent(instance.content as Type<any>, { injector });
  //   instance.viewRef = ref.hostView;
  //   instance.saveInstance?.(ref.instance);
  //   this.host.add(instance);
  // }

  // attachTemplate(instance: DialogModel<any, any>) {
  //   const view = this.container.createEmbeddedView(instance.content as TemplateRef<any>, instance.data);
  //   instance.viewRef = view;
  //   this.host.add(instance);
  // }

  // detach(id: number) {
  //   const dialog = this.host.get(String(id));
  //   if (dialog?.viewRef) {
  //     this.container.remove(this.container.indexOf(dialog.viewRef));
  //   }
  //   this.host.remove(String(id));
  // }
  // createDialogInjector(dialog: DialogModel<any, any>): Injector {
  //   return Injector.create({
  //     providers: [
  //       { provide: 'DIALOG_DATA', useValue: dialog.data },
  //       { provide: DialogModel, useValue: dialog.model },
  //     ],
  //     parent: dialog.injector || undefined,
  //   });
  // }
}
