import { Component, Input } from '@angular/core';
import { IconDots } from '../../../../core/icons/icon-dots/icon-dots';
import { IconTrash } from '../../../../core/icons/icon-trash/icon-trash';
import { RouterLink } from '@angular/router';
import { ModalDirective } from '../../../../core/directives/modal-directive';

@Component({
  selector: 'app-password-entry-preview-actions',
  imports: [IconDots, IconTrash, RouterLink, ModalDirective],
  templateUrl: './password-entry-preview-actions.html',
  styleUrl: './password-entry-preview-actions.css',
})
export class PasswordEntryPreviewActions {
  @Input({ required: true })
  entryId!: string;

  isOpen = false;

  toggleModal() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }
}
