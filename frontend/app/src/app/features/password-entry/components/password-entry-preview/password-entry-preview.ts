import { Component, inject, Input } from '@angular/core';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { IconTrash } from '../../../../core/icons/icon-trash/icon-trash';
import { RouterLink } from '@angular/router';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { AuthService } from '../../../Auth/services/auth.service';
import { MasterPasswordDialogService } from '../../../crypto/master-password/services/master-password-dialog-service';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-password-entry-preview',
  imports: [IconEye, IconTrash, RouterLink, AsyncPipe],
  templateUrl: './password-entry-preview.html',
  styleUrl: './password-entry-preview.css',
})
export class PasswordEntryPreview {
  @Input({ required: true }) entry!: IPasswordEntryDto;

  cryptoService = inject(CryptoService);
  authService = inject(AuthService);
  private masterPasswordDialogService = inject(MasterPasswordDialogService);

  private password = new BehaviorSubject<string>('******');
  password$ = this.password.asObservable();

  async onShowPassword() {
    const encryptedPassword = this.entry.encryptedPassword;
    const iv = this.entry.iv;

    if (!encryptedPassword || !iv) {
      console.error('Encrypted password or IV is missing.');
      return;
    }

    if (!this.cryptoService.checkEncryptionKeyInitialized()) {
      const masterPassword = await this.masterPasswordDialogService.openMasterPasswordDialog();
      if (!masterPassword) {
        console.error('Master password is required to encrypt the password entry.');
        return;
      }
      const plainSalt = this.authService.get_master_password_salt();
      if (!plainSalt) {
        console.error('Master password salt is missing.');
        return;
      }

      const salt = this.cryptoService.base64ToArrayBuffer(plainSalt);
      await this.cryptoService.deriveMasterEncryptionKey({ masterPassword, salt });
    }

    try {
      const decryptedPassword = await this.cryptoService.decryptPassword(
        this.cryptoService.base64ToArrayBuffer(encryptedPassword),
        this.cryptoService.base64ToArrayBuffer(iv)
      );
      this.password.next(decryptedPassword);
    } catch (error) {
      console.log('🚀 ~ PasswordEntryPreview ~ onShowPassword ~ error:', error);
    }
  }
}
