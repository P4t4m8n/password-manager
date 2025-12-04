import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ErrorService } from '../../../../core/services/error-service';
import { MasterPasswordHttpService } from '../../services/master-password-http-service';
import { MasterPasswordDialogService } from '../../services/master-password-dialog-service';
import { ShowMasterPasswordDialogService } from '../../services/show-master-password-dialog-service';
import { MasterPasswordRecoveryService } from '../../services/master-password-recovery-service';
import { ConfirmationDialogService } from '../../../../core/dialogs/confirmation-dialog/services/confirmation-dialog-service';

import { BackButton } from '../../../../core/components/back-button/back-button';

import type { IMasterPasswordRecoveryResponseDTO } from '../../interfaces/master-password-recovery-response-dto';
@Component({
  selector: 'app-master-password-recovery-page',
  imports: [ReactiveFormsModule, BackButton],
  templateUrl: './master-password-recovery-page.html',
  styleUrl: './master-password-recovery-page.css',
})
export class MasterPasswordRecoveryPage implements OnInit {
  #masterPasswordHttpService = inject(MasterPasswordHttpService);
  #masterPasswordDialogService = inject(MasterPasswordDialogService);
  #confirmationDialogService = inject(ConfirmationDialogService);
  #showMasterPasswordService = inject(ShowMasterPasswordDialogService);
  #masterPasswordRecoveryService = inject(MasterPasswordRecoveryService);
  #errorService = inject(ErrorService);

  #router = inject(Router);

  #recoveryData: IMasterPasswordRecoveryResponseDTO | null = null;

  recoveryKeyControl = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.#masterPasswordHttpService.getMasterPasswordRecovery().subscribe({
      next: (data) => {
        this.#recoveryData = data;
      },
      error: (err) => {
        this.#errorService.handleError(err, { showErrorDialog: true });
      },
    });
  }

  isSubmitDisabled(): boolean {
    return this.recoveryKeyControl.invalid;
  }

  async onDecryptRecovery() {
    try {
      if (!this.#recoveryData) {
        throw new Error('No recovery data available.');
      }

      if (
        this.recoveryKeyControl.invalid ||
        this.recoveryKeyControl.value === '' ||
        this.recoveryKeyControl.value === null
      ) {
        throw new Error('Recovery key is required.');
      }

      const masterPassword =
        await this.#masterPasswordRecoveryService.decryptMasterPasswordWithRecovery({
          encryptedMasterKeyWithRecovery: this.#recoveryData.encryptedMasterKeyWithRecovery,
          recoveryKey: this.recoveryKeyControl.value,
          recoveryIV: this.#recoveryData.recoveryIV,
        });

      const isUpdateMaster = await this.#confirmationDialogService.openDialog();
      let newMasterPassword = null;

      if (!isUpdateMaster) {
        await this.#showMasterPasswordService.openDialog({
          masterPassword,
        });

        const isRecrateRecoveryKey = await this.#confirmationDialogService.openDialog({
          message: 'Do you want to create a new recovery key?',
        });

        if (isRecrateRecoveryKey) {
          newMasterPassword = masterPassword;
        } else {
          this.#router.navigate(['/entries']);
          return;
        }
      }

      //TODO:Refactor to use while...do
      if (!newMasterPassword) {
        newMasterPassword = await this.#masterPasswordDialogService.openDialog({
          mode: 'new',
        });
      }

      if (!newMasterPassword) {
        this.#errorService.handleError('New master password is required.', {
          showErrorDialog: true,
        });

        return;
      }

      await this.#masterPasswordRecoveryService.updateMasterKeyAndReEncryptEntries(
        masterPassword,
        newMasterPassword
      );
    } catch (error) {
      this.#errorService.handleError(error, { showErrorDialog: true });
    }
  }
}
