import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthHttpService } from '../../auth/services/auth-http-service';
import { CryptoService } from '../../crypto/services/crypto.service';
import { PasswordEntryHttpService } from '../../password-entry/services/password-entry-http-service';
import { MasterPasswordHttpService } from './master-password-http-service';
import { MasterPasswordSaltSessionService } from './master-password-salt-session-service';

import { TCredentials } from '../../crypto/types/credentials.type';
import { IPasswordEntryDto } from '../../password-entry/interfaces/passwordEntry';

type TDecryptMasterPasswordProps = Omit<TCredentials, 'masterPasswordSalt'> & {
  recoveryKey: string;
};

type TDecryptedEntries = Array<IPasswordEntryDto & { decryptedPassword: string }>;

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordRecoveryService {
  #cryptoService = inject(CryptoService);
  #masterPasswordHttpService = inject(MasterPasswordHttpService);
  #passwordEntryHttpService = inject(PasswordEntryHttpService);
  #masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);
  #authService = inject(AuthHttpService);

  async decryptMasterPasswordWithRecovery({
    encryptedMasterKeyWithRecovery,
    recoveryKey,
    recoveryIV,
  }: TDecryptMasterPasswordProps): Promise<string> {
    return await this.#cryptoService.handleDecryptMasterKeyWithRecovery({
      encryptedMasterKeyWithRecovery,
      recoveryKey,
      recoveryIV,
    });
  }

  async updateMasterKeyAndReEncryptEntries(
    oldMasterPassword: string,
    newMasterPassword: string
  ): Promise<void> {
    if (!this.#masterPasswordSaltSessionService.checkSaltInitialized()) {
      throw new Error('Master password salt is missing in session.');
    }

    const saltBuffer = this.#cryptoService.base64ToArrayBuffer(
      this.#masterPasswordSaltSessionService.currentSalt!
    );

    await this.#cryptoService.deriveMasterEncryptionKey({
      masterPassword: oldMasterPassword,
      saltBuffer,
    });

    const decryptedEntries = await this.#decryptAllEntries();

    await this.#createNewMasterPassword(newMasterPassword);

    // Re-encrypt entries with new master password
    await this.#reEncryptEntries(decryptedEntries);
  }

  async #decryptAllEntries(): Promise<TDecryptedEntries> {
    const { data: allPasswordEntries } = await firstValueFrom(this.#passwordEntryHttpService.get());

    return Promise.all(
      allPasswordEntries.map(async (entry) => {
        if (!entry.encryptedPassword || !entry.iv) {
          throw new Error(`Entry ${entry.id} is missing encrypted password or IV`);
        }
        const decryptedPassword = await this.#cryptoService.decryptPassword(
          entry.encryptedPassword,
          entry.iv
        );
        return { ...entry, decryptedPassword };
      })
    );
  }

  async #createNewMasterPassword(newMasterPassword: string): Promise<void> {
    const { recoveryKey, recoveryIV, encryptedMasterKeyWithRecovery, masterPasswordSalt } =
      await this.#cryptoService.handleMasterPasswordCreation(newMasterPassword);

    const response = await firstValueFrom(
      this.#masterPasswordHttpService.updateMasterPassword({
        recoveryIV,
        encryptedMasterKeyWithRecovery,
        masterPasswordSalt,
      })
    );

    if (!response.data) {
      throw new Error(`Master password update failed:${response.message ?? ''}`);
    }

    this.#cryptoService.downloadRecoveryKey(
      recoveryKey,
      this.#authService.get_session_user()?.email ?? ''
    );
    return;
  }

  async #reEncryptEntries(decryptedEntries: TDecryptedEntries): Promise<void> {
    const reEncryptedEntries = await Promise.all(
      decryptedEntries.map(async (entry) => {
        const { encrypted, iv } = await this.#cryptoService.encryptPassword(
          entry.decryptedPassword
        );
        return {
          id: entry.id,
          entryName: entry.entryName,
          websiteUrl: entry.websiteUrl,
          entryUserName: entry.entryUserName,
          encryptedPassword: this.#cryptoService.arrayBufferToBase64(encrypted),
          iv: this.#cryptoService.arrayBufferToBase64(iv),
          notes: entry.notes,
        };
      })
    );

    await firstValueFrom(this.#passwordEntryHttpService.updateAfterRecovery(reEncryptedEntries));
    return;
  }
}
