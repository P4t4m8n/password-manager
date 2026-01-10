import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PasswordEntryHttpService } from '../../services/password-entry-http-service';

import { MenuDirective } from '../../../../core/directives/menu-directive';

import { IconDots } from '../../../../core/icons/icon-dots/icon-dots';
import { IconTrash } from '../../../../core/icons/icon-trash/icon-trash';
import { ErrorService } from '../../../../core/services/error-service';
import { LoadingService } from '../../../../core/services/loading-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-password-entry-preview-actions',
  imports: [IconDots, IconTrash, RouterLink, MenuDirective, AsyncPipe],
  templateUrl: './password-entry-preview-actions.html',
  styleUrl: './password-entry-preview-actions.css',
  providers: [LoadingService],
})
export class PasswordEntryPreviewActions {
  @Input({ required: true }) entryId!: string;

  #passwordEntryHttpService = inject(PasswordEntryHttpService);
  #errorService = inject(ErrorService);
  #loadingService = inject(LoadingService);

  public isDeleteing$ = this.#loadingService.isDeleting$;

  isOpen = false;

  toggleModal() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }

  onDelete() {
    if (this.entryId) {
      this.#loadingService.setDeleting(true);
      this.#passwordEntryHttpService.delete(this.entryId).subscribe({
        next: () => {},
        error: (err) => {
          this.#errorService.handleError(err, { showToast: true });
        },
        complete: () => {
          this.#loadingService.setDeleting(false);
        },
      });
    }
  }
}
