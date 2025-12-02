import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { CryptoService } from '../../crypto/services/crypto.service';
import { PasswordEntryHttpService } from '../../password-entry/services/password-entry-http-service';
import { MasterPasswordHttpService } from './master-password-http-service';
import { MasterPasswordSaltSessionService } from './master-password-salt-session-service';
import { firstValueFrom } from 'rxjs';
import { TCredentials } from '../../crypto/types/credentials.type';

type TDecryptMasterPasswordProps = Omit<TCredentials, 'masterPasswordSalt'> & {
  recoveryKey: string;
};

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordRecoveryService {
  private _cryptoService = inject(CryptoService);
  private _masterPasswordHttpService = inject(MasterPasswordHttpService);
  private _passwordEntryHttpService = inject(PasswordEntryHttpService);
  private _masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);
  private _authService = inject(AuthService);

  async decryptMasterPasswordWithRecovery({
    encryptedMasterKeyWithRecovery,
    recoveryKey,
    recoveryIV,
  }: TDecryptMasterPasswordProps): Promise<string> {
    return await this._cryptoService.handleDecryptMasterKeyWithRecovery({
      encryptedMasterKeyWithRecovery,
      recoveryKey,
      recoveryIV,
    });
  }

  async updateMasterKeyAndReEncryptEntries(
    oldMasterPassword: string,
    newMasterPassword: string
  ): Promise<void> {
    if (!this._masterPasswordSaltSessionService.checkSaltInitialized()) {
      throw new Error('Master password salt is missing in session.');
    }

    const saltBuffer = this._cryptoService.base64ToArrayBuffer(
      this._masterPasswordSaltSessionService.currentSalt!
    );

    await this._cryptoService.deriveMasterEncryptionKey({
      masterPassword: oldMasterPassword,
      saltBuffer,
    });

    const decryptedEntries = await this._decryptAllEntries();

    await this._createNewMasterPassword(newMasterPassword);

    // Re-encrypt entries with new master password
    await this._reEncryptEntries(decryptedEntries);
  }

  private async _decryptAllEntries() {
    const { data: allPasswordEntries } = await firstValueFrom(this._passwordEntryHttpService.get());

    return Promise.all(
      allPasswordEntries.map(async (entry) => {
        if (!entry.encryptedPassword || !entry.iv) {
          throw new Error(`Entry ${entry.id} is missing encrypted password or IV`);
        }
        const decryptedPassword = await this._cryptoService.decryptPassword(
          entry.encryptedPassword,
          entry.iv
        );
        return { ...entry, decryptedPassword };
      })
    );
  }

  private async _createNewMasterPassword(newMasterPassword: string) {
    const { recoveryKey, recoveryIV, encryptedMasterKeyWithRecovery, masterPasswordSalt } =
      await this._cryptoService.handleMasterPasswordCreation(newMasterPassword);

    const response = await firstValueFrom(
      this._masterPasswordHttpService.updateMasterPassword({
        recoveryIV,
        encryptedMasterKeyWithRecovery,
        masterPasswordSalt,
      })
    );

    if (!response.data) {
      throw new Error(`Master password update failed:${response.message ?? ''}`);
    }

    this._cryptoService.downloadRecoveryKey(
      recoveryKey,
      this._authService.get_session_user()?.email ?? ''
    );
  }

  private async _reEncryptEntries(
    decryptedEntries: {
      decryptedPassword: string;
      entryName?: string | undefined;
      websiteUrl?: string | undefined;
      entryUserName?: string | undefined;
      encryptedPassword?: string | undefined;
      iv?: string | undefined;
      notes?: string | undefined;
      id?: string | undefined;
      createdAt?: string | Date | undefined;
      updatedAt?: string | Date | undefined;
    }[]
  ): Promise<void> {
    const reEncryptedEntries = await Promise.all(
      decryptedEntries.map(async (entry) => {
        const { encrypted, iv } = await this._cryptoService.encryptPassword(
          entry.decryptedPassword
        );
        return {
          id: entry.id,
          entryName: entry.entryName,
          websiteUrl: entry.websiteUrl,
          entryUserName: entry.entryUserName,
          encryptedPassword: this._cryptoService.arrayBufferToBase64(encrypted),
          iv: this._cryptoService.arrayBufferToBase64(iv),
          notes: entry.notes,
        };
      })
    );

    await firstValueFrom(this._passwordEntryHttpService.updateAfterRecovery(reEncryptedEntries));
  }
}
