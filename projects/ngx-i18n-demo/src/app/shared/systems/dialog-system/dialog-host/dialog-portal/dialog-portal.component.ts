import { Component, Input, TemplateRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogModel } from '../../dialog.model';

@Component({
  selector: 'app-dialog-portal',
  imports: [],
  templateUrl: './dialog-portal.component.html',
  styleUrl: './dialog-portal.component.scss',
  standalone: true,
})
export class DialogPortalComponent {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  @Input() dialog!: DialogModel<any, any>;

  ngAfterViewInit() {
    if (this.dialog.content instanceof TemplateRef) {
      const tempRef = this.container.createEmbeddedView(this.dialog.content, {
        $implicit: this.dialog.config,
      });
      this.dialog.embeddedViewRef = tempRef;
    } else {
      const compRef = this.container.createComponent(this.dialog.content as Type<any>, {
        injector: this.dialog.injector,
      });
      this.dialog.viewRef = compRef.hostView;
      this.dialog.componentRef = compRef;
    }
  }
}
