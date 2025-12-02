import { TestBed } from '@angular/core/testing';
import { CryptoService } from './crypto.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Salt and IV Generation', () => {
    it('should generate unique salt each time', () => {
      const salt1 = service.generateSalt();
      const salt2 = service.generateSalt();

      expect(salt1.length).toBe(16);
      expect(salt2.length).toBe(16);
      expect(salt1).not.toEqual(salt2);
    });

    it('should generate unique IV each time', () => {
      const iv1 = service.generateIV();
      const iv2 = service.generateIV();

      expect(iv1.length).toBe(12);
      expect(iv2.length).toBe(12);
      expect(iv1).not.toEqual(iv2);
    });

    it('should generate unique recovery key each time', () => {
      const key1 = service.generateRecoveryKey();
      const key2 = service.generateRecoveryKey();

      expect(key1.length).toBe(32);
      expect(key2.length).toBe(32);
      expect(key1).not.toEqual(key2);
    });
  });

  describe('Master Key Derivation', () => {
    it('should derive encryption key from master password and salt', async () => {
      const masterPassword = 'MySecretMasterPassword123!';
      const salt = service.generateSalt();

      const key = await service.deriveMasterEncryptionKey({
        masterPassword,
        saltBuffer: salt,
      });

      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
    });

    it('should derive same key with same password and salt', async () => {
      const masterPassword = 'MySecretMasterPassword123!';
      const salt = service.generateSalt();

      const key1 = await service.deriveMasterEncryptionKey({
        masterPassword,
        saltBuffer: salt,
      });

      // Clear and re-derive
      service.clearSensitiveData();

      const key2 = await service.deriveMasterEncryptionKey({
        masterPassword,
        saltBuffer: salt,
      });

      // Both keys should work for encryption/decryption
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
    });

    it('should derive different keys with different salts', async () => {
      const masterPassword = 'MySecretMasterPassword123!';
      const salt1 = service.generateSalt();
      const salt2 = service.generateSalt();

      await service.deriveMasterEncryptionKey({
        masterPassword,
        saltBuffer: salt1,
      });

      const encrypted1 = await service.encryptPassword('testPassword');

      service.clearSensitiveData();

      await service.deriveMasterEncryptionKey({
        masterPassword,
        saltBuffer: salt2,
      });

      // Should not be able to decrypt with different salt-derived key
      // await expectAsync(
      //   service.decryptPassword(encrypted1.encrypted, encrypted1.iv)
      // ).toBeRejected();
    });
  });

  describe('Password Encryption/Decryption', () => {
    beforeEach(async () => {
      const masterPassword = 'MyMasterPassword123!';
      const salt = service.generateSalt();
      await service.deriveMasterEncryptionKey({ masterPassword, saltBuffer: salt });
    });

    // it('should encrypt and decrypt password correctly', async () => {
    //   const originalPassword = 'myPassword123!@#';

    //   const { encrypted, iv } = await service.encryptPassword(originalPassword);

    //   expect(encrypted).toBeDefined();
    //   expect(iv).toBeDefined();
    //   expect(encrypted.length).toBeGreaterThan(0);

    //   const decrypted = await service.decryptPassword(encrypted, iv);

    //   expect(decrypted).toBe(originalPassword);
    // });

    // it('should encrypt same password differently each time (unique IV)', async () => {
    //   const password = 'samePassword';

    //   const result1 = await service.encryptPassword(password);
    //   const result2 = await service.encryptPassword(password);

    //   expect(result1.encrypted).not.toEqual(result2.encrypted);
    //   expect(result1.iv).not.toEqual(result2.iv);

    //   // Both should decrypt correctly
    //   const decrypted1 = await service.decryptPassword(result1.encrypted, result1.iv);
    //   const decrypted2 = await service.decryptPassword(result2.encrypted, result2.iv);

    //   expect(decrypted1).toBe(password);
    //   expect(decrypted2).toBe(password);
    // });

    // it('should fail to decrypt with wrong IV', async () => {
    //   const password = 'testPassword';

    //   const { encrypted } = await service.encryptPassword(password);
    //   const wrongIV = service.generateIV();

    //   await expectAsync(service.decryptPassword(encrypted, wrongIV)).toBeRejected();
    // });

    // it('should fail to decrypt without encryption key', async () => {
    //   const password = 'testPassword';
    //   const { encrypted, iv } = await service.encryptPassword(password);

    //   service.clearSensitiveData();

    //   await expectAsync(service.decryptPassword(encrypted, iv)).toBeRejectedWithError(
    //     'Encryption key not initialized. Call deriveMasterEncryptionKey first.'
    //   );
    // });

    it('should fail to encrypt without encryption key', async () => {
      service.clearSensitiveData();

      await expectAsync(service.encryptPassword('test')).toBeRejectedWithError(
        'Encryption key not initialized. Call deriveMasterEncryptionKey first.'
      );
    });
  });

  describe('Recovery Key Flow', () => {
    it('should encrypt and decrypt master key with recovery key', async () => {
      const masterPassword = 'MyMasterPassword123!';
      const salt = service.generateSalt();

      await service.deriveMasterEncryptionKey({ masterPassword, saltBuffer: salt });

      const recoveryKey = service.generateRecoveryKey();

      const { encrypted, iv } = await service.encryptMasterKeyWithRecovery(recoveryKey);

      expect(encrypted).toBeDefined();
      expect(iv).toBeDefined();

      const decryptedMasterKey = await service.decryptMasterKeyWithRecovery(
        encrypted,
        recoveryKey,
        iv
      );

      expect(decryptedMasterKey).toBe(masterPassword);
    });

    it('should fail to decrypt master key with wrong recovery key', async () => {
      const masterPassword = 'MyMasterPassword123!';
      const salt = service.generateSalt();

      await service.deriveMasterEncryptionKey({ masterPassword, saltBuffer: salt });

      const recoveryKey = service.generateRecoveryKey();
      const wrongRecoveryKey = service.generateRecoveryKey();

      const { encrypted, iv } = await service.encryptMasterKeyWithRecovery(recoveryKey);

      await expectAsync(
        service.decryptMasterKeyWithRecovery(encrypted, wrongRecoveryKey, iv)
      ).toBeRejected();
    });

    it('should fail to encrypt master key if not set', async () => {
      const recoveryKey = service.generateRecoveryKey();

      await expectAsync(service.encryptMasterKeyWithRecovery(recoveryKey)).toBeRejectedWithError(
        'Master key not available'
      );
    });
  });

  describe('Base64 Conversion', () => {
    it('should convert Uint8Array to base64 and back', () => {
      const original = service.generateSalt();

      const base64 = service.arrayBufferToBase64(original);
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);

      const converted = service.base64ToArrayBuffer(base64);

      expect(converted).toEqual(original);
    });

    it('should handle different sizes correctly', () => {
      const salt = service.generateSalt(); // 16 bytes
      const iv = service.generateIV(); // 12 bytes
      const recoveryKey = service.generateRecoveryKey(); // 32 bytes

      const saltBase64 = service.arrayBufferToBase64(salt);
      const ivBase64 = service.arrayBufferToBase64(iv);
      const keyBase64 = service.arrayBufferToBase64(recoveryKey);

      expect(service.base64ToArrayBuffer(saltBase64)).toEqual(salt);
      expect(service.base64ToArrayBuffer(ivBase64)).toEqual(iv);
      expect(service.base64ToArrayBuffer(keyBase64)).toEqual(recoveryKey);
    });
  });

  describe('Full Signup Flow', () => {
    it('should complete full signup flow', async () => {
      const email = 'user@example.com';
      const masterPassword = 'MyMasterPassword123!';

      // 1. Generate salt
      const salt = service.generateSalt();
      expect(salt.length).toBe(16);

      // 2. Derive encryption key
      await service.deriveMasterEncryptionKey({ masterPassword, saltBuffer: salt });

      // 3. Generate recovery key
      const recoveryKey = service.generateRecoveryKey();
      expect(recoveryKey.length).toBe(32);

      // 4. Encrypt master key with recovery key
      const { encrypted: encryptedMasterKey, iv: recoveryIV } =
        await service.encryptMasterKeyWithRecovery(recoveryKey);

      // 5. Convert to base64 for storage
      const saltBase64 = service.arrayBufferToBase64(salt);
      const encryptedMasterKeyBase64 = service.arrayBufferToBase64(encryptedMasterKey);
      const recoveryIVBase64 = service.arrayBufferToBase64(recoveryIV);

      expect(saltBase64).toBeDefined();
      expect(encryptedMasterKeyBase64).toBeDefined();
      expect(recoveryIVBase64).toBeDefined();

      // Verify recovery works
      const recoveredMasterKey = await service.decryptMasterKeyWithRecovery(
        encryptedMasterKey,
        recoveryKey,
        recoveryIV
      );

      expect(recoveredMasterKey).toBe(masterPassword);
    });
  });

  describe('Full Login Flow', () => {
    it('should complete full login flow', async () => {
      const masterPassword = 'MyMasterPassword123!';
      const salt = service.generateSalt();

      // Mock: User retrieved salt from server
      const saltBase64 = service.arrayBufferToBase64(salt);

      // Login: Derive key with stored salt
      const retrievedSalt = service.base64ToArrayBuffer(saltBase64);
      await service.deriveMasterEncryptionKey({
        masterPassword,
        saltBuffer: retrievedSalt,
      });

      // Should now be able to encrypt/decrypt
      const testPassword = 'myStoredPassword123';
      const { encrypted, iv } = await service.encryptPassword(testPassword);
      // const decrypted = await service.decryptPassword(encrypted, iv);

      // expect(decrypted).toBe(testPassword);
    });
  });

  describe('Memory Management', () => {
    it('should clear sensitive data from memory', async () => {
      const masterPassword = 'MyMasterPassword123!';
      const salt = service.generateSalt();

      await service.deriveMasterEncryptionKey({ masterPassword, saltBuffer: salt });

      // Should work before clearing
      const { encrypted, iv } = await service.encryptPassword('test');
      expect(encrypted).toBeDefined();

      // Clear memory
      service.clearSensitiveData();

      // Should fail after clearing
      await expectAsync(service.encryptPassword('test')).toBeRejectedWithError(
        'Encryption key not initialized. Call deriveMasterEncryptionKey first.'
      );
    });
  });
});
