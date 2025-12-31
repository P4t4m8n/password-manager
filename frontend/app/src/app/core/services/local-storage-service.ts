import { Injectable } from '@angular/core';



export type TLocalDataKeys = 'user-settings'|'master-password';

export const STORGE_MODES = ['none', 'session', 'local'] as const;
export type TStorageMode = (typeof STORGE_MODES)[number];

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  static storeLocalData<T>({
    data,
    key,
    mode = 'session',
    expiredIn,
  }: {
    data: T;
    key: TLocalDataKeys;
    mode: Omit<TStorageMode, 'none'>;
    expiredIn?: number;
  }) {
    const jsonDate = JSON.stringify(data);

    const storageObject = {
      data: jsonDate,
      timestamp: new Date().getTime(),
      expiredIn: expiredIn ?? null,
    };
    if (mode === 'local') {
      localStorage.setItem(key, JSON.stringify(storageObject));
    } else {
      sessionStorage.setItem(key, JSON.stringify(storageObject));
    }
  }

  static getLocalData<T>({
    key,
    mode = 'session',
  }: {
    key: TLocalDataKeys;
    mode: Omit<TStorageMode, 'none'>;
  }): T | null {
    const storedItem = mode === 'local' ? localStorage.getItem(key) : sessionStorage.getItem(key);

    if (!storedItem) {
      return null;
    }

    const storageObject = JSON.parse(storedItem);
    if (
      storageObject.expiredIn !== null &&
      new Date().getTime() - storageObject.timestamp > storageObject.expiredIn
    ) {
      this.removeLocalData({ key, mode });
      return null;
    }
    return JSON.parse(storageObject.data) as T;
  }

  static removeLocalData({
    key,
    mode = 'session',
  }: {
    key: TLocalDataKeys;
    mode: Omit<TStorageMode, 'none'>;
  }): void {
    return mode === 'local' ? localStorage.removeItem(key) : sessionStorage.removeItem(key);
  }
}
