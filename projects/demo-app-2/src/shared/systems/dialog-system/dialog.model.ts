import { signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DialogService } from './dialog.service';
import { DialogInstance } from './dialog.type';

export class DialogRef<T = any> {
  private close$ = new Subject<T | undefined>();
  instance?: T;
  constructor(
    public id: string,
    private servcie: DialogService,
  ) {}
  close(result?: T): void {
    this.close$.next(result);
    this.close$.complete();
    this.servcie.list.remove(this.id);
  }
  afterClosed(): Observable<T | undefined> {
    return this.close$.asObservable();
  }
}

export class DialogList {
  dialogs: WritableSignal<DialogInstance[]> = signal([]);

  add(dialog: DialogInstance): void {
    this.dialogs.update((list) => [...list, dialog]);
  }

  remove(id: string): void {
    this.dialogs.update((list) => list.filter((i) => i.id !== id));
  }

  clear(): void {
    this.dialogs().forEach((dialog) => {
      dialog.ref.close();
    });
  }

  get(id: string): DialogInstance | undefined {
    return this.dialogs().find((i) => i.id === id);
  }

  has(id: string): boolean {
    return !!this.get(id);
  }
}
