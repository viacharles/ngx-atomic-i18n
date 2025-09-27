import { Component, Input, TemplateRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogInstance } from '../../dialog.type';

@Component({
  selector: 'app-dialog-portal',
  imports: [],
  templateUrl: './dialog-portal.component.html',
  styleUrl: './dialog-portal.component.scss',
})
export class DialogPortalComponent {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  @Input() dialog!: DialogInstance;

  ngAfterViewInit() {
    if (this.dialog.content instanceof TemplateRef) {
      this.container.createEmbeddedView(this.dialog.content, {
        $implicit: this.dialog.config,
      });
    } else {
      const ref = this.container.createComponent(this.dialog.content as Type<any>, {
        injector: this.dialog.injector,
      });
      this.dialog.viewRef = ref.hostView;
      this.dialog.saveInstance?.(ref.instance);
    }
  }
}
