import { Injectable } from '@angular/core';

export type TLocalDataKeys = 'user-settings' | 'master-password';

export const STORGE_MODES = ['none', 'session', 'local'] as const;
export type TStorageMode = (typeof STORGE_MODES)[number];
export interface IStorageObject<T> {
  data: string;
  timestamp: number;
  expiredIn: number | null;
}

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

    const { data, expiredIn, timestamp }: IStorageObject<T | null> = JSON.parse(storedItem);

    if (!data) {
      return null;
    }

    if (expiredIn !== null && new Date().getTime() - timestamp > expiredIn) {
      this.removeLocalData({ key, mode });
      return null;
    }

    return JSON.parse(data);
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
