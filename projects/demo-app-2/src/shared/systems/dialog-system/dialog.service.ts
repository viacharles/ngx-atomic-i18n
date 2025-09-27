import { Injectable, Injector, Type } from '@angular/core';
import { DialogList, DialogRef } from './dialog.model';
import { DIALOG_DATA } from './dialog.token';
import { DialogTriggerStatus } from './dialog.trigger';
import { DialogConfig, DialogInstance } from './dialog.type';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private idCounter = 0;
  list = new DialogList();

  constructor(private globalInjector: Injector) {}

  openPage<C, T = any>(
    content: Type<C>,
    options: {
      data?: T;
      id?: string;
    },
    config?: DialogConfig<T>,
    selfInjector?: Injector,
  ): DialogInstance<T> {
    const id = String(options.id ?? ++this.idCounter);
    const dialogRef = new DialogRef<T>(id, this);
    const finalOptions = {
      ...options,
      animationTriggerStatus: DialogTriggerStatus.SlideInOutFromRight,
    };
    return this.open(content, finalOptions, config, selfInjector);
  }

  open<C, T = any>(
    content: Type<C>,
    options: {
      data?: T;
      id?: string;
    },
    config?: DialogConfig<T>,
    selfInjector?: Injector,
  ): DialogInstance<T> {
    const id = String(options.id ?? ++this.idCounter);
    const dialogRef = new DialogRef<T>(id, this);
    const injector = Injector.create({
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: options.data },
      ],
      parent: selfInjector,
    });
    const dialog: DialogInstance<T> = {
      id,
      content,
      ...options,
      ref: dialogRef,
      config,
      injector,
      saveInstance: (ref: T) => (dialogRef.instance = ref),
    };
    this.list.add(dialog);
    return dialog;
  }

  close(id: string): void {
    this.list.remove(id);
  }

  closeAll(): void {
    this.list.clear();
  }
}
