import { Component, inject, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AbstractDialog } from '../../../../core/abstracts/dialog.abstract';

import type { TMasterPasswordDialogMode } from '../../types/master-password-types';
import { IconEye } from "../../../../core/icons/icon-eye/icon-eye";
import { RevelInputPasswordDirective } from '../../../../core/directives/revel-input-password-directive';

@Component({
  selector: 'app-master-password-dialog',
  imports: [ReactiveFormsModule, IconEye,RevelInputPasswordDirective],
  templateUrl: './master-password-dialog.html',
    styleUrl: './master-password-dialog.css',

})
export class MasterPasswordDialog extends AbstractDialog<string | null> {
  @Input() mode?: TMasterPasswordDialogMode = 'unlock';

  form = inject(FormBuilder).group({
    masterPassword: ['', Validators.required],
  });

  #router = inject(Router);

  get title(): string {
    return this.mode === 'unlock' ? 'Enter Master Password' : 'Set Master Password';
  }

  get description(): string {
    return this.mode === 'unlock'
      ? 'Your session has expired. Please re-enter your master password.'
      : 'Create a new master password to secure your data.';
  }

  get submitLabel(): string {
    return this.mode === 'unlock' ? 'Unlock' : 'Set Password';
  }

  get showRecoveryLink(): boolean {
    return this.mode === 'unlock';
  }

  navigateToRecovery(): void {
    this.cancel();
    this.#router.navigate(['/recovery']);
    this.resolve(null);
  }

  override submit(): void {
    if (this.form.valid) {
      this.resolve(this.form.value.masterPassword!);
    }
  }
}
