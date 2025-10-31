import { TemplateRef, Type } from '@angular/core';
import { DialogTriggerStatus } from './dialog.trigger';
import { Option } from 'projects/ngx-i18n-demo/src/app/shared/interfaces/common.interface';

export interface DialogConfig<T> {
  showBackground?: boolean;
  transparentBackdrop?: boolean;
  closeOnBackdropClick?: boolean;
}

export type DialogContent = Type<any> | TemplateRef<any>;

export interface DialogComponentInterface {
  animationTrigger: DialogTriggerStatus;
}

export interface DialogFallback<O> {
  close: (value: O) => void;
}

export interface DropdownData {
  options: Option[];
  title: string;
  anchorEl: HTMLElement;   // 錨點元素（select/button 的 DOM）
  minHeight?: number;
  margin?: number;
}
