import { inject, Injectable } from '@angular/core';
import { IPasswordEntryDto } from '../interfaces/passwordEntry';
import { AuthService } from '../../Auth/services/auth.service';
import { CryptoService } from '../../crypto/services/crypto.service';
import { MasterPasswordDialogService } from '../../crypto/master-password/services/master-password-dialog-service';

@Injectable({
  providedIn: 'root',
})
export class PasswordEntryService {
  private cryptoService = inject(CryptoService);
  private authService = inject(AuthService);
  private masterPasswordDialogService = inject(MasterPasswordDialogService);

  async decryptPassword({
    encryptedPassword,
    iv,
  }: Pick<IPasswordEntryDto, 'encryptedPassword' | 'iv'>): Promise<string | null> {
    if (!encryptedPassword || !iv) {
      console.error('Encrypted password or IV is missing.');
      return null;
    }

    if (!this.cryptoService.checkEncryptionKeyInitialized()) {
      const masterPassword = await this.masterPasswordDialogService.openMasterPasswordDialog();
      if (!masterPassword) {
        console.error('Master password is required to encrypt the password entry.');
        return null;
      }
      const plainSalt = this.authService.get_master_password_salt();
      if (!plainSalt) {
        console.error('Master password salt is missing.');
        return null;
      }

      const salt = this.cryptoService.base64ToArrayBuffer(plainSalt);
      await this.cryptoService.deriveMasterEncryptionKey({ masterPassword, salt });
    }

    try {
      const decryptedPassword = await this.cryptoService.decryptPassword(
        this.cryptoService.base64ToArrayBuffer(encryptedPassword),
        this.cryptoService.base64ToArrayBuffer(iv)
      );
      return decryptedPassword;
    } catch (error) {
      console.error('🚀 ~ PasswordEntryPreview ~ onShowPassword ~ error:', error);
      return null;
    }
  }
}
