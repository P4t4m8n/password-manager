import { Component, inject, OnInit } from '@angular/core';
import { MasterPasswordHttpService } from '../../services/master-password-http-service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IMasterPasswordRecoveryResponseDTO } from '../../interfaces/masterPasswordRecoveryResponseDTO';
import { MasterPasswordDialogService } from '../../services/master-password-dialog-service';
import { ConfirmationDialogService } from '../../../../core/confirmation-dialog/services/confirmation-dialog-service';
import { ShowMasterPasswordDialogService } from '../../services/show-master-password-dialog-service';
import { BackButton } from '../../../../core/components/back-button/back-button';
import { FetchingErrorDialogService } from '../../../../core/fetching-error-dialog/services/fetching-error-dialog-service';
import { MasterPasswordRecoveryService } from '../../services/master-password-recovery-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-password-recovery-page',
  imports: [ReactiveFormsModule, BackButton],
  templateUrl: './master-password-recovery-page.html',
  styleUrl: './master-password-recovery-page.css',
})
export class MasterPasswordRecoveryPage implements OnInit {
  private masterPasswordHttpService = inject(MasterPasswordHttpService);
  private masterPasswordDialogService = inject(MasterPasswordDialogService);
  private confirmationDialogService = inject(ConfirmationDialogService);
  private showMasterPasswordService = inject(ShowMasterPasswordDialogService);
  private fetchingErrorDialogService = inject(FetchingErrorDialogService);
  private masterPasswordRecoveryService = inject(MasterPasswordRecoveryService);

  private router = inject(Router);

  recoveryKeyControl = new FormControl('', [Validators.required]);

  private recoveryData: IMasterPasswordRecoveryResponseDTO | null = null;

  ngOnInit(): void {
    this.masterPasswordHttpService.getMasterPasswordRecovery().subscribe({
      next: (data) => {
        this.recoveryData = data;
      },
      error: () => {
        this.fetchingErrorDialogService.openDialogWithProps({
          message: 'Failed to fetch master password recovery data.',
          backPath: '/entries',
          backButtonText: 'Go to Entries',
        });
      },
    });
  }

  isSubmitDisabled(): boolean {
    return this.recoveryKeyControl.invalid;
  }

  async onDecryptRecovery() {
    try {
      if (!this.recoveryData) {
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
        await this.masterPasswordRecoveryService.decryptMasterPasswordWithRecovery({
          encryptedMasterKeyWithRecovery: this.recoveryData.encryptedMasterKeyWithRecovery,
          recoveryKey: this.recoveryKeyControl.value,
          recoveryIV: this.recoveryData.recoveryIV,
        });

      const isUpdateMaster = await this.confirmationDialogService.openDialog();
      let newMasterPassword = null;

      if (!isUpdateMaster) {
        await this.showMasterPasswordService.openDialogWithProps({
          masterPassword,
        });

        const isRecrateRecoveryKey = await this.confirmationDialogService.openDialogWithProps({
          message: 'Do you want to create a new recovery key?',
        });

        if (isRecrateRecoveryKey) {
          newMasterPassword = masterPassword;
        } else {
          this.router.navigate(['/entries']);
          return;
        }
      }

      if (!newMasterPassword) {
        newMasterPassword = await this.masterPasswordDialogService.openDialogWithProps({
          mode: 'new',
        });
      }

      if (!newMasterPassword) {
        this.fetchingErrorDialogService.openDialogWithProps({
          message: 'New master password is required to update the master key.',
          backPath: '/entries',
          backButtonText: 'Go to Entries',
        });
        return;
      }

      await this.masterPasswordRecoveryService.updateMasterKeyAndReEncryptEntries(
        masterPassword,
        newMasterPassword
      );

    } catch (error) {
      console.error('Error during master password recovery:', error);
      this.fetchingErrorDialogService.openDialogWithProps({
        message: 'An error occurred during the recovery process.',
        backPath: '/entries',
        backButtonText: 'Go to Entries',
      });
    }
  }
}
