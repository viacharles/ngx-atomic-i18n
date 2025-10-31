import { signal, WritableSignal } from '@angular/core';
import { DialogModel } from './dialog.model';


export class DialogList {
  dialogs: WritableSignal<DialogModel<any, any>[]> = signal([]);

  add(dialog: DialogModel<any, any>): void {
    this.dialogs.update((list) => [...list, dialog]);
  }

  remove(id: string): void {
    this.dialogs.update((list) => list.filter((i) => i.id !== id));
  }

  clear(): void {
    this.dialogs().forEach((dialog) => {
      dialog.close();
    });
  }

  get(id: string): DialogModel<any, any> | undefined {
    return this.dialogs().find((i) => i.id === id);
  }

  has(id: string): boolean {
    return !!this.get(id);
  }
}
