import { inject, Injectable } from '@angular/core';
import { LocalStorageMappings } from './_typings/local-storage/local-storage.typings';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  getItem<T extends keyof LocalStorageMappings>(
    key: T
  ): LocalStorageMappings[T] | null {
    if (key === 'showLegend') {
      return (localStorage.getItem(key) === ('true' as unknown)) as
        | LocalStorageMappings[T]
        | null;
    }
    return localStorage.getItem(key) as LocalStorageMappings[T] | null;
  }

  setItems<T extends keyof LocalStorageMappings>(
    itemsMap: Map<T, LocalStorageMappings[T]>
  ): void {
    itemsMap.forEach((value, key) => localStorage.setItem(key, String(value)));
  }
}
