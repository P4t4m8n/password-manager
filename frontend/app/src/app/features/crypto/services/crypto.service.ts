import { inject, Injectable } from '@angular/core';
import { MasterPasswordDialogService } from '../../master-password/services/master-password-dialog-service';
import { MasterPasswordSaltSessionService } from '../../master-password/services/master-password-salt-session-service';

type TCredentials = {
  recoveryIVBase64: string;
  encryptedMasterKeyWithRecoveryBase64: string;
  masterPasswordSaltBase64: string;
  recoveryKey: Uint8Array<ArrayBuffer>;
};
@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private _encryptionKey: CryptoKey | null = null;
  private _masterKey: string | null = null;

  private _masterPasswordDialogService = inject(MasterPasswordDialogService);
  private _masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);

  checkEncryptionKeyInitialized(): this is { _encryptionKey: CryptoKey } {
    return this._encryptionKey !== null;
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

    this._encryptionKey = derivedKey;
    this._masterKey = masterPassword;

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
      this._encryptionKey!,
      data
    );

    return {
      encrypted: new Uint8Array(encryptedBuffer),
      iv: iv,
    };
  }

  async decryptPassword(encryptedPasswordStr?: string, ivStr?: string): Promise<string> {
    if (!this._encryptionKey) {
      throw new Error('Encryption key not initialized. Call deriveMasterEncryptionKey first.');
    }

    if (!encryptedPasswordStr || !ivStr) {
      throw new Error('Encrypted password or IV is missing');
    }

    const encrypted = this.base64ToArrayBuffer(encryptedPasswordStr);
    const iv = this.base64ToArrayBuffer(ivStr);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this._encryptionKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  generateRecoveryKey(): Uint8Array<ArrayBuffer> {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  async encryptMasterKeyWithRecovery(
    recoveryKey: Uint8Array<ArrayBuffer>
  ): Promise<{ encrypted: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer> }> {
    if (!this._masterKey) {
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
    const masterKeyBuffer = encoder.encode(this._masterKey);
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
    this._encryptionKey = null;
    this._masterKey = null;
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

  async handleMasterPasswordCreation(masterPassword: string): Promise<TCredentials> {
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
      recoveryIVBase64,
      encryptedMasterKeyWithRecoveryBase64,
      masterPasswordSaltBase64,
      recoveryKey,
    };
  }

  async initializeMasterPassword(): Promise<void> {
    if (this.checkEncryptionKeyInitialized()) return;

    const masterPassword = await this._masterPasswordDialogService.openDialogWithProps({
      mode: 'unlock',
    });

    if (!masterPassword) {
      throw new Error('Master password is required to initialize encryption key.');
    }

    if (!this._masterPasswordSaltSessionService.checkSaltInitialized()) {
      throw new Error('Master password salt is missing.');
    }
    const saltBuffer = this.base64ToArrayBuffer(
      this._masterPasswordSaltSessionService.currentSalt!
    );

    await this.deriveMasterEncryptionKey({ masterPassword, saltBuffer });
  }
}
