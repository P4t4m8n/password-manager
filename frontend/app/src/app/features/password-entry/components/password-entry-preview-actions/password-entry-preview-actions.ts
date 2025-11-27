import { Component, inject, Input } from '@angular/core';
import { IconDots } from '../../../../core/icons/icon-dots/icon-dots';
import { IconTrash } from '../../../../core/icons/icon-trash/icon-trash';
import { RouterLink } from '@angular/router';
import { MenuDirective } from '../../../../core/directives/menu-directive';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';

@Component({
  selector: 'app-password-entry-preview-actions',
  imports: [IconDots, IconTrash, RouterLink, MenuDirective],
  templateUrl: './password-entry-preview-actions.html',
  styleUrl: './password-entry-preview-actions.css',
})
export class PasswordEntryPreviewActions {
  @Input({ required: true })
  entryId!: string;

  private passwordEntryHttpService = inject(PasswordEntryHttpService);

  isOpen = false;

  toggleModal() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }

  onDelete() {
    if (this.entryId) {
      this.passwordEntryHttpService.delete(this.entryId).subscribe({
        next: () => {},
        error: (err) => {
          console.error('Failed to delete password entry:', err);
        },
      });
    }
  }
}
