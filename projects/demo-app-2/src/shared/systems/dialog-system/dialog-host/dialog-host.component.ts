import { Component, inject, Injector, TemplateRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogRef } from '../dialog.model';
import { DialogService } from '../dialog.service';
import { dialogtrigger } from '../dialog.trigger';
import { DialogInstance } from '../dialog.type';
import { DialogPortalComponent } from './dialog-portal/dialog-portal.component';
export interface DialogComponentWithAnimation extends Type<any> {
  animationTrigger?: string;
}
@Component({
  selector: 'app-dialog-host',
  imports: [DialogPortalComponent],
  templateUrl: './dialog-host.component.html',
  styleUrl: './dialog-host.component.scss',
  animations: [dialogtrigger],
})
export class DialogHostComponent {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  host = inject(DialogService).list;

  typeTemp(dialog: DialogInstance): TemplateRef<unknown> {
    return dialog.content as TemplateRef<unknown>;
  }
  typeComponent(dialog: DialogInstance): any {
    return dialog.content;
  }
  backdropClick(dialog: DialogInstance): void {
    if (dialog.config?.closeOnBackdropClick === true) {
      dialog.ref.close(dialog);
    }
  }
  isTemplate(dialog: DialogInstance): boolean {
    return dialog.content instanceof TemplateRef;
  }

  getAnimation(dialog: DialogInstance): string {
    const animationTrigger = (dialog.ref.instance as DialogComponentWithAnimation)?.animationTrigger;
    return animationTrigger ?? '';
  }

  attachComponent(instance: DialogInstance) {
    const injector = this.createDialogInjector(instance);
    const ref = this.container.createComponent(instance.content as Type<any>, { injector });
    instance.viewRef = ref.hostView;
    instance.saveInstance?.(ref.instance);
    this.host.add(instance);
  }

  attachTemplate(instance: DialogInstance) {
    const view = this.container.createEmbeddedView(instance.content as TemplateRef<any>, instance.data);
    instance.viewRef = view;
    this.host.add(instance);
  }

  detach(id: number) {
    const dialog = this.host.get(String(id));
    if (dialog?.viewRef) {
      this.container.remove(this.container.indexOf(dialog.viewRef));
    }
    this.host.remove(String(id));
  }
  createDialogInjector(dialog: DialogInstance): Injector {
    return Injector.create({
      providers: [
        { provide: 'DIALOG_DATA', useValue: dialog.data },
        { provide: DialogRef, useValue: dialog.ref },
      ],
      parent: dialog.injector || undefined,
    });
  }
}
