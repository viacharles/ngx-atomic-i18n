import { Injectable, ViewContainerRef } from '@angular/core';
import { Toast } from './toast.type';
import { MSG_TYPE } from '@demo2-shared/enums/common.enum';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private idCounter = 0;
  hostRef?: ViewContainerRef;
  list: Toast[] = [];

  open(
    type: MSG_TYPE,
    content: string,
  ): Toast {
    let model: Toast = {
      id: String(++this.idCounter),
      content,
      type,
    };
    this.list.push(model);
    return model;
  }

  close(id: string): void {
    this.list = this.list.filter(i => i.id !== id);
  }

  closeAll(): void {
    this.list = [];
  }
}
