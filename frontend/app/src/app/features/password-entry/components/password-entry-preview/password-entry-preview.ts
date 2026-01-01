import { Component, inject, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CryptoService } from '../../../crypto/services/crypto.service';
import { ErrorService } from '../../../../core/services/error-service';

import { AsyncPipe } from '@angular/common';

import { PasswordEntryPreviewActions } from '../password-entry-preview-actions/password-entry-preview-actions';

import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';

import type { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';

@Component({
  selector: 'app-password-entry-preview',
  imports: [IconEye, AsyncPipe, IconFavorite, IconCopyPassword, PasswordEntryPreviewActions],
  templateUrl: './password-entry-preview.html',
  styleUrl: './password-entry-preview.css',
})
export class PasswordEntryPreview {
  @Input({ required: true }) entry!: IPasswordEntryDto;

  #cryptoService = inject(CryptoService);
  #errorService = inject(ErrorService);
  #passwordEntryHttpService = inject(PasswordEntryHttpService);

  #password = new BehaviorSubject<string>('******');
  public password$ = this.#password.asObservable();

  async onShowPassword() {
    try {
      const encryptedPassword = this.entry.encryptedPassword;
      const iv = this.entry.iv;

      await this.#cryptoService.initializeMasterPassword();

      const decryptedPassword = await this.#cryptoService.decryptPassword(encryptedPassword, iv);
      this.#password.next(decryptedPassword);
    } catch (error) {
      this.#errorService.handleError(error, { showToast: true });
    }
  }

  onLike() {
    const entryId = this.entry.id;

    if (!entryId) {
      this.#errorService.handleError(new Error('Invalid entry ID'), {
        showToast: true,
        customMessage: 'Cannot like entry: Invalid ID.',
      });
      return;
    }
    
    this.#passwordEntryHttpService.likePasswordEntry(entryId).subscribe({
      next: () => {
        // Like updated in service state
      },
      error: (err) => {
        this.#errorService.handleError(err, { showToast: true });
      },
    });
  }
}
