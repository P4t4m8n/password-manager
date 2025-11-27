import { Component, inject, Input } from '@angular/core';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';
import { PasswordEntryPreviewActions } from '../password-entry-preview-actions/password-entry-preview-actions';
import { MasterPasswordDialogService } from '../../../master-password/services/master-password-dialog-service';

@Component({
  selector: 'app-password-entry-preview',
  imports: [IconEye, AsyncPipe, IconFavorite, IconCopyPassword, PasswordEntryPreviewActions],
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
      const masterPassword = await this.masterPasswordDialogService.openDialogWithProps({
        mode: 'unlock',
      });
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
      console.error('🚀 ~ PasswordEntryPreview ~ onShowPassword ~ error:', error);
    }
  }
}
