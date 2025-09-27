import { Injector, TemplateRef, Type, ViewRef } from '@angular/core';
import { DialogRef } from './dialog.model';
import { DialogTriggerStatus } from './dialog.trigger';

export interface DialogConfig<T> {
  showBackground?: boolean;
  closeOnBackdropClick?: boolean;
}

export interface DialogInstance<T = any, O = any> {
  id: string;
  content: Type<any> | TemplateRef<any>;
  ref: DialogRef;
  viewRef?: ViewRef;
  injector?: Injector;
  data?: T;
  config?: DialogConfig<T>;
  fallback?: DialogFallback<O>;
  saveInstance?: (instance: any) => void;

  // dialog專用
  animationTriggerStatus?: DialogTriggerStatus;
}

export type DialogContent = Type<any> | TemplateRef<any>;

export interface DialogComponentInterface {
  animationTrigger: DialogTriggerStatus;
}

export interface DialogFallback<O> {
  close: (value: O) => void;
}
