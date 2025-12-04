import { Component, EventEmitter, inject, Output } from '@angular/core';

import { AbstractDialog } from '../../../../core/abstracts/dialog.abstract';
import { PasswordGeneratorDialogService } from '../../services/password-generator-dialog-service';

import { PasswordGenerator } from '../password-generator/password-generator';

@Component({
  selector: 'app-password-generator-dialog',
  imports: [PasswordGenerator],
  templateUrl: './password-generator-dialog.html',
  styleUrl: './password-generator-dialog.css',
})
export class PasswordGeneratorDialog extends AbstractDialog<string | null> {
  @Output() passwordSelected = new EventEmitter<string>();

  #passwordGeneratorDialogService = inject(PasswordGeneratorDialogService);

  onPasswordSelected(password: string) {
    this.resolve(password);
  }

  override submit() {}

  onOpen() {
    this.#passwordGeneratorDialogService.openDialog();
  }
}
