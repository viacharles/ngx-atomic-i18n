import { ComponentRef, EmbeddedViewRef, Injector, TemplateRef, Type, ViewRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DialogService } from './dialog.service';
import { DialogConfig } from './dialog.type';
import { DialogTriggerStatus } from './dialog.trigger';

/**
 * @param C Component type
 * @param T Data type
 * @param R Return type
 */
export class DialogModel<C, T = any, R = any> {
  private close$ = new Subject<R | undefined>();
  embeddedViewRef?: EmbeddedViewRef<any>;
  componentRef?: ComponentRef<any>;
  viewRef?: ViewRef;
  animationTriggerStatus?: DialogTriggerStatus;
  get instance(): C | undefined {
    return this.componentRef?.instance;
  }

  injector?: Injector;

  private pendingList: Array<[string, unknown]> = [];
  constructor(
    public id: string,
    private service: DialogService,
    public config?: DialogConfig<T>,
    public content?: Type<C> | TemplateRef<any>,
    public data?: T | undefined,
  ) { }
  close(result?: R): void {
    this.close$.next(result);
    this.close$.complete();
    this.service.list.remove(this.id);
  }
  afterClosed(): Observable<R | undefined> {
    return this.close$.asObservable();
  }


  _flushPending(): void {
    if (!this.componentRef) return;
    for (const [key, value] of this.pendingList) {
      this.componentRef.setInput(key, value);
    }
    this.pendingList = [];
  }
}
