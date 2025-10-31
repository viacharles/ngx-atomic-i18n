import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _loadingMap = signal<Record<string, boolean>>({});
  setLoading(key: string, isLoading: boolean) {
    this._loadingMap.update((map) => ({ ...map, [key]: isLoading }));
  }
  isLoading$(key: string): WritableSignal<boolean> {
    return signal(!!this._loadingMap()[key]);
  }
  snapshot() {
    return this._loadingMap();
  }
}
