import { Component, inject, Input } from '@angular/core';

import { ErrorService } from '../../../../core/services/error-service';


import { PasswordEntryPreviewActions } from '../password-entry-preview-actions/password-entry-preview-actions';

import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';

import type { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { ShowPassword } from '../../../crypto/components/show-password/show-password';

@Component({
  selector: 'app-password-entry-preview',
  imports: [IconFavorite, IconCopyPassword, PasswordEntryPreviewActions, ShowPassword],
  templateUrl: './password-entry-preview.html',
  styleUrl: './password-entry-preview.css',
})
export class PasswordEntryPreview {
  @Input({ required: true }) entry!: IPasswordEntryDto;

  #errorService = inject(ErrorService);
  #passwordEntryHttpService = inject(PasswordEntryHttpService);

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
