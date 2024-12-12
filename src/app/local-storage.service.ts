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
    return localStorage.getItem(key) as LocalStorageMappings[T] | null;
  }

  setItems<T extends keyof LocalStorageMappings>(
    itemsMap: Map<T, LocalStorageMappings>
  ): void {
    itemsMap.forEach((value, key) =>
      localStorage.setItem(key, value as unknown as string)
    );
  }
}
