import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalLoadingService {
  constructor() {}
  apiSet = signal<Set<string>>(new Set());
  isLoading = computed<boolean>(() => {
    return this.apiSet().size > 0;
  });

  deleteLoading(key: string): void {
    this.apiSet.update((set) => {
      const newSet = new Set(set);
      newSet.delete(key);
      return newSet;
    });
  }

  addLoading(key: string): void {
    this.apiSet.update((set) => new Set(set).add(key));
  }
}
