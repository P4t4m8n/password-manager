import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private encryptionKey: CryptoKey | null = null;
  private masterKey: string | null = null;

  checkEncryptionKeyInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  async deriveMasterEncryptionKey({
    masterPassword,
    salt,
    iterations = 100000,
  }: {
    masterPassword: string;
    salt: Uint8Array<ArrayBuffer>;
    iterations?: number;
  }): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);

    const importedKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
      'deriveKey',
    ]);

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256',
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.encryptionKey = derivedKey;
    this.masterKey = masterPassword;

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
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized. Call deriveMasterEncryptionKey first.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = this.generateIV();

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
      data
    );

    return {
      encrypted: new Uint8Array(encryptedBuffer),
      iv: iv,
    };
  }

  async decryptPassword(
    encrypted: Uint8Array<ArrayBuffer>,
    iv: Uint8Array<ArrayBuffer>
  ): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized. Call deriveMasterEncryptionKey first.');
    }

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.encryptionKey,
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
    if (!this.masterKey) {
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
    const masterKeyBuffer = encoder.encode(this.masterKey);
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
    this.encryptionKey = null;
    this.masterKey = null;
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

  async handleMasterPasswordCreation(masterPassword: string): Promise<{
    recoveryIVBase64: string;
    encryptedMasterKeyWithRecoveryBase64: string;
    masterPasswordSaltBase64: string;
    recoveryKey: Uint8Array<ArrayBuffer>;
  }> {
    const masterPasswordSalt = this.generateSalt();
    await this.deriveMasterEncryptionKey({
      masterPassword,
      salt: masterPasswordSalt,
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
      recoveryKey
    };
  }
}
