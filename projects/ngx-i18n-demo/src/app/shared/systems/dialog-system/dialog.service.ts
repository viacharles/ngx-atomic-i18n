import { EnvironmentInjector, Injectable, Injector, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { DialogModel } from './dialog.model';
import { DIALOG_DATA } from './dialog.token';
import { DialogTriggerStatus } from './dialog.trigger';
import { DialogConfig } from './dialog.type';
import { DialogList } from './dialog-list.model';
import { DescribeDialogComponent } from './components/describe-dialog/describe-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private idCounter = 0;
  hostRef?: ViewContainerRef;
  private pendingDialogs: Array<() => void> = [];
  list = new DialogList();

  constructor(
    private enInjector: EnvironmentInjector
  ) { }

  openPage<C, T = any>(
    content: Type<C>,
    options: {
      data?: T;
      id?: string;
    },
    config?: DialogConfig<T>,
    selfInjector?: Injector,
  ): DialogModel<C, T> {
    const finalOptions = {
      ...options,
      animationTriggerStatus: DialogTriggerStatus.SlideInOutFromRight,
    };
    return this.open(content, finalOptions, config, selfInjector);
  }

  openDescribe(
    describe: string,
    config?: DialogConfig<string>,
    selfInjector?: Injector
  ): DialogModel<DescribeDialogComponent, string> {
    const finalConfig = { transparentBackdrop: true, closeOnBackdropClick: true, ...config }
    return this.open(DescribeDialogComponent, { data: describe }, finalConfig, selfInjector)
  }

  open<C, T = any>(
    content: Type<C> | TemplateRef<any>,
    options: {
      data?: T;
      id?: string;
    },
    config?: DialogConfig<T>,
    selfInjector?: Injector,
  ): DialogModel<C, T> {
    const id = String(options.id ?? ++this.idCounter);
    const model = new DialogModel<C, T>(id, this,
      { closeOnBackdropClick: true, ...config },
      content, options.data);
    const injector = Injector.create({
      providers: [
        { provide: DialogModel, useValue: model },
        { provide: DIALOG_DATA, useValue: options.data },
      ],
      parent: selfInjector,
    });
    model.injector = injector;
    const materialize = () => {
      if (!this.hostRef) return;
      if (content instanceof TemplateRef) {
        const temp = this.hostRef.createEmbeddedView(content, { $implicit: options.data });
        model.embeddedViewRef = temp;
      } else {
        const comp = this.hostRef.createComponent(content as Type<any>, { injector, environmentInjector: this.enInjector });
        model.componentRef = comp;
        model._flushPending();
      }
    }
    this.list.add(model);
    if (!this.hostRef) this.pendingDialogs.push(materialize);
    return model;
  }

  close(id: string): void {
    this.list.remove(id);
  }

  closeAll(): void {
    this.list.clear();
  }

  registerHost(ref: ViewContainerRef): void {
    this.hostRef = ref;
    this.runPendingDialogs();
  }

  runPendingDialogs(): void {
    for (const job of this.pendingDialogs) job();
    this.pendingDialogs = [];
  }
}
