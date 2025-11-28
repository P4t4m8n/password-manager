import { Component, inject, Input } from '@angular/core';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';
import { PasswordEntryPreviewActions } from '../password-entry-preview-actions/password-entry-preview-actions';

@Component({
  selector: 'app-password-entry-preview',
  imports: [IconEye, AsyncPipe, IconFavorite, IconCopyPassword, PasswordEntryPreviewActions],
  templateUrl: './password-entry-preview.html',
  styleUrl: './password-entry-preview.css',
})
export class PasswordEntryPreview {
  @Input({ required: true }) entry!: IPasswordEntryDto;

  private _cryptoService = inject(CryptoService);

  private _password = new BehaviorSubject<string>('******');
  public password$ = this._password.asObservable();

  async onShowPassword() {
    try {
      const encryptedPassword = this.entry.encryptedPassword;
      const iv = this.entry.iv;

      await this._cryptoService.initializeMasterPassword();

      const decryptedPassword = await this._cryptoService.decryptPassword(encryptedPassword, iv);
      this._password.next(decryptedPassword);
    } catch (error) {
      console.error('🚀 ~ PasswordEntryPreview ~ onShowPassword ~ error:', error);
    }
  }
}
