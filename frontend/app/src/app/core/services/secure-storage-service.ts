import { Injectable } from '@angular/core';

const DB_NAME = 'password-manager-secure';
const STORE_NAME = 'secrets';

@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  #db: IDBDatabase | null = null;
  #wrappingKey: CryptoKey | null = null;

  async initialize(): Promise<void> {
    this.#wrappingKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
      'encrypt',
      'decrypt',
    ]);

    this.#db = await this.#openDatabase();
  }

  async store(key: string, value: string): Promise<void> {
    if (!this.#wrappingKey || !this.#db) {
      throw new Error('SecureStorageService not initialized');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(value);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.#wrappingKey,
      encoded
    );

    await this.#putToDb(key, {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    });
  }

  async retrieve(key: string): Promise<string | null> {
    if (!this.#wrappingKey || !this.#db) {
      throw new Error('SecureStorageService not initialized');
    }

    const stored = await this.#getFromDb(key);
    if (!stored) return null;

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(stored.iv) },
        this.#wrappingKey,
        new Uint8Array(stored.data)
      );
      return new TextDecoder().decode(decrypted);
    } catch {
      await this.remove(key);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    if (!this.#db) return;

    return new Promise((resolve, reject) => {
      const tx = this.#db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  #openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  #putToDb(key: string, value: { data: number[]; iv: number[] }): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.#db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  #getFromDb(key: string): Promise<{ data: number[]; iv: number[] } | null> {
    return new Promise((resolve, reject) => {
      const tx = this.#db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }
}
