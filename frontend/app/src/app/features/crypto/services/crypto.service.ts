import { inject, Injectable } from '@angular/core';

import { MasterPasswordDialogService } from '../../master-password/services/master-password-dialog-service';
import { MasterPasswordSaltSessionService } from '../../master-password/services/master-password-salt-session-service';

import type { TCredentials } from '../types/credentials.type';
import { UserSettingsStateService } from '../../settings/services/user-settings-state-service';
import { LocalStorageService } from '../../../core/services/local-storage-service';

const MINUTE = 60 * 1000;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const DEFAULT_SESSION_EXPIRY_IN_MINUTES = 30;
@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  #encryptionKey: CryptoKey | null = null;
  #masterKey: string | null = null;

  #masterPasswordDialogService = inject(MasterPasswordDialogService);
  #masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);
  #userSettingsStateService = inject(UserSettingsStateService);

  async checkEncryptionKeyInitialized(): Promise<boolean> {
    const masterPasswordSaveMode =
      this.#userSettingsStateService.getCurrentState()?.masterPasswordStorageMode;

    if (masterPasswordSaveMode === 'local' || masterPasswordSaveMode === 'session') {
      const masterPassword = LocalStorageService.getLocalData<string>({
        key: 'master-password',
        mode: masterPasswordSaveMode,
      });

      if (!masterPassword) {
        return false;
      }

      await this.deriveMasterEncryptionKey({
        masterPassword: masterPassword,
        saltBuffer: this.base64ToArrayBuffer(this.#masterPasswordSaltSessionService.currentSalt!),
      });

      this.#masterKey = masterPassword ?? null;
    }

    return this.#encryptionKey !== null;
  }

  async deriveMasterEncryptionKey({
    masterPassword,
    saltBuffer,
  }: {
    masterPassword: string;
    saltBuffer: Uint8Array<ArrayBuffer>;
  }): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);

    const importedKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
      'deriveKey',
    ]);

    const iterations = 100000;

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: iterations,
        hash: 'SHA-256',
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.#encryptionKey = derivedKey;
    this.#masterKey = masterPassword;
  

    return derivedKey;
  }

  generateSalt(): Uint8Array<ArrayBuffer> {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  generateIV(): Uint8Array<ArrayBuffer> {
    return crypto.getRandomValues(new Uint8Array(12));
  }

  async encryptPassword(
    plaintext: string
  ): Promise<{ encrypted: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer> }> {
    await this.initializeMasterPassword();

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = this.generateIV();

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.#encryptionKey!,
      data
    );

    return {
      encrypted: new Uint8Array(encryptedBuffer),
      iv: iv,
    };
  }

  async decryptPassword(encryptedPasswordStr?: string, ivStr?: string): Promise<string> {
    await this.initializeMasterPassword();

    if (!this.#encryptionKey) {
      throw new Error(
        'Encryption key not initialized in decryptPassword-> THIS SHOULD NOT HAPPEN!!!'
      );
    }

    if (!encryptedPasswordStr || !ivStr) {
      throw new Error('Encrypted password or IV is missing');
    }

    const encrypted = this.base64ToArrayBuffer(encryptedPasswordStr);
    const iv = this.base64ToArrayBuffer(ivStr);

    const decryptedBuffer = await crypto.subtle
      .decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.#encryptionKey,
        encrypted
      )
      .catch((err) => {
        console.error('Decryption failed:', err);
        throw new Error('Failed to decrypt password. It may be corrupted or the key is invalid.');
      });

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  generateRecoveryKey(): Uint8Array<ArrayBuffer> {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  async encryptMasterKeyWithRecovery(
    recoveryKey: Uint8Array<ArrayBuffer>
  ): Promise<{ encrypted: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer> }> {
    if (!this.#masterKey) {
      throw new Error('Master key not available');
    }

    const recoveryEncryptionKey = await crypto.subtle.importKey(
      'raw',
      recoveryKey,
      'AES-GCM',
      false,
      ['encrypt']
    );

    const encoder = new TextEncoder();
    const masterKeyBuffer = encoder.encode(this.#masterKey);
    const iv = this.generateIV();

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      recoveryEncryptionKey,
      masterKeyBuffer
    );

    return {
      encrypted: new Uint8Array(encryptedBuffer),
      iv: iv,
    };
  }

  async decryptMasterKeyWithRecovery(
    encryptedMasterKey: Uint8Array<ArrayBuffer>,
    recoveryKey: Uint8Array<ArrayBuffer>,
    iv: Uint8Array<ArrayBuffer>
  ): Promise<string> {
    const recoveryEncryptionKey = await crypto.subtle.importKey(
      'raw',
      recoveryKey,
      'AES-GCM',
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      recoveryEncryptionKey,
      encryptedMasterKey
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  arrayBufferToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer));
  }

  base64ToArrayBuffer(base64: string): Uint8Array<ArrayBuffer> {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  clearSensitiveData(): void {
    this.#encryptionKey = null;
    this.#masterKey = null;

    LocalStorageService.removeLocalData({
      key: 'master-password',
      mode: 'local',
    });
    LocalStorageService.removeLocalData({
      key: 'master-password',
      mode: 'session',
    });
  }

  downloadRecoveryKey(recoveryKey: Uint8Array, username: string): void {
    const base64Key = this.arrayBufferToBase64(recoveryKey);
    const blob = new Blob([`Recovery Key for ${username}\n\n${base64Key}\n\nKeep this safe!`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recovery-key-${username}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async handleMasterPasswordCreation(
    masterPassword: string
  ): Promise<TCredentials & { recoveryKey: Uint8Array<ArrayBuffer> }> {
    const masterPasswordSalt = this.generateSalt();
    await this.deriveMasterEncryptionKey({
      masterPassword,
      saltBuffer: masterPasswordSalt,
    });

    const recoveryKey = this.generateRecoveryKey();
    const { encrypted: encryptedMasterKeyWithRecovery, iv: recoveryIV } =
      await this.encryptMasterKeyWithRecovery(recoveryKey);

    const masterPasswordSaltBase64 = this.arrayBufferToBase64(masterPasswordSalt);
    const encryptedMasterKeyWithRecoveryBase64 = this.arrayBufferToBase64(
      encryptedMasterKeyWithRecovery
    );
    const recoveryIVBase64 = this.arrayBufferToBase64(recoveryIV);

    return {
      recoveryIV: recoveryIVBase64,
      encryptedMasterKeyWithRecovery: encryptedMasterKeyWithRecoveryBase64,
      masterPasswordSalt: masterPasswordSaltBase64,
      recoveryKey,
    };
  }

  async initializeMasterPassword(): Promise<void> {
    if (await this.checkEncryptionKeyInitialized()) return;

    const masterPassword = await this.#masterPasswordDialogService.openDialog({
      mode: 'unlock',
    });

    if (!masterPassword) {
      throw new Error('Master password is required to initialize encryption key.');
    }

    if (!this.#masterPasswordSaltSessionService.checkSaltInitialized()) {
      throw new Error('Master password salt is missing.');
    }
    const saltBuffer = this.base64ToArrayBuffer(this.#masterPasswordSaltSessionService.currentSalt);

    await this.deriveMasterEncryptionKey({ masterPassword, saltBuffer });
  }

  async handleDecryptMasterKeyWithRecovery({
    recoveryKey,
    recoveryIV,
    encryptedMasterKeyWithRecovery,
  }: {
    recoveryKey: string;
    recoveryIV: string;
    encryptedMasterKeyWithRecovery: string;
  }) {
    const recoveryKeyBuffer = this.base64ToArrayBuffer(recoveryKey);
    const recoveryIVBuffer = this.base64ToArrayBuffer(recoveryIV);
    const encryptedMasterKeyWithRecoveryBuffer = this.base64ToArrayBuffer(
      encryptedMasterKeyWithRecovery
    );
    return await this.decryptMasterKeyWithRecovery(
      encryptedMasterKeyWithRecoveryBuffer,
      recoveryKeyBuffer,
      recoveryIVBuffer
    );
  }

  async persistMasterPassword(masterPassword?: string | null): Promise<void> {
    if (!masterPassword) {
      await this.initializeMasterPassword();
      masterPassword = this.#masterKey;
    }

    const { masterPasswordStorageMode, autoLockTimeInMinutes, masterPasswordTTLInMinutes } =
      this.#userSettingsStateService.getCurrentState() ?? {};
    const ttlMinutes = Number(masterPasswordTTLInMinutes) || DEFAULT_SESSION_EXPIRY_IN_MINUTES;
    const expiredIn = ttlMinutes * MINUTE;

    switch (masterPasswordStorageMode) {
      case 'local':
        LocalStorageService.storeLocalData({
          data: masterPassword,
          key: 'master-password',
          mode: 'local',
          expiredIn,
        });
        break;
      case 'session':
        LocalStorageService.storeLocalData({
          data: masterPassword,
          key: 'master-password',
          mode: 'session',
          expiredIn,
        });
        break;
      default:
        break;
    }
  }
}
