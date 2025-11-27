import { Component, inject, OnInit } from '@angular/core';
import { MasterPasswordHttpService } from '../../services/master-password-http-service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IMasterPasswordRecoveryResponseDTO } from '../../interfaces/masterPasswordRecoveryResponseDTO';
import { MasterPasswordDialogService } from '../../services/master-password-dialog-service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { PasswordEntryHttpService } from '../../../password-entry/services/password-entry-http-service';
import { ConfirmationDialogService } from '../../../../core/confirmation-dialog/services/confirmation-dialog-service';
import { ShowMasterPasswordDialogService } from '../../services/show-master-password-dialog-service';

@Component({
  selector: 'app-master-password-recovery-page',
  imports: [ReactiveFormsModule],
  templateUrl: './master-password-recovery-page.html',
  styleUrl: './master-password-recovery-page.css',
})
export class MasterPasswordRecoveryPage implements OnInit {
  private masterPasswordHttpService = inject(MasterPasswordHttpService);
  private formBuilder = inject(FormBuilder);
  private cryptoService = inject(CryptoService);
  private authService = inject(AuthService);
  private masterPasswordDialogService = inject(MasterPasswordDialogService);
  private confirmationDialogService = inject(ConfirmationDialogService);
  private passwordEntryHttpService = inject(PasswordEntryHttpService);
  private showMasterPasswordService = inject(ShowMasterPasswordDialogService);

  recoveryKeyControl = this.formBuilder.control('');

  private recoveryData: IMasterPasswordRecoveryResponseDTO | null = null;

  ngOnInit(): void {
    this.masterPasswordHttpService.getMasterPasswordRecovery().subscribe({
      next: (data) => {
        this.recoveryData = data;
      },
      error: (error) => {
        console.error('Error fetching master password recovery data:', error);
      },
    });
  }

  async onDecryptRecovery() {
    if (!this.recoveryData) {
      console.error('No recovery data available');
      return;
    }

    if (!this.recoveryKeyControl.value) {
      console.error('Recovery key is required');
      return;
    }
    const recoveryKey = this.cryptoService.base64ToArrayBuffer(this.recoveryKeyControl.value);
    const recoveryIV = this.cryptoService.base64ToArrayBuffer(this.recoveryData.recoveryIV);
    const encryptedMasterKeyWithRecovery = this.cryptoService.base64ToArrayBuffer(
      this.recoveryData.encryptedMasterKeyWithRecovery
    );

    const masterPassword = await this.cryptoService.decryptMasterKeyWithRecovery(
      encryptedMasterKeyWithRecovery,
      recoveryKey,
      recoveryIV
    );
    console.log(
      '🚀 ~ MasterPasswordRecoveryPage ~ onDecryptRecovery ~ masterPassword:',
      masterPassword
    );

    const isUpdateMaster = await this.confirmationDialogService.openDialog();

    if (!isUpdateMaster) {
      await this.showMasterPasswordService.openDialogWithProps({
        masterPassword,
      });
      return;
    }

    const newMasterPassword = await this.masterPasswordDialogService.openDialogWithProps({
      mode: 'new',
    });
    if (!newMasterPassword) {
      console.error('New master password is required');
      return;
    }
    await this.updateMasterKey(newMasterPassword);
  }

  async updateMasterKey(newMasterPassword: string) {
    try {
      if (!this.cryptoService.checkEncryptionKeyInitialized()) {
        const masterPassword = await this.masterPasswordDialogService.openDialogWithProps({
          mode: 'unlock',
        });
        if (!masterPassword) {
          console.error('Master password is required to encrypt the password entry.');
          return;
        }

        const plainSalt = this.authService.get_master_password_salt();
        if (!plainSalt) {
          console.error('Master password salt is missing.');
          return;
        }

        const salt = this.cryptoService.base64ToArrayBuffer(plainSalt);
        await this.cryptoService.deriveMasterEncryptionKey({ masterPassword, salt });
      }

      const { data: allPasswordEntries } = await firstValueFrom(
        this.passwordEntryHttpService.get()
      );
      console.log(
        '🚀 ~ MasterPasswordRecoveryPage ~ updateMasterKey ~ allPasswordEntries:',
        allPasswordEntries
      );

      const decryptedEntries = await Promise.all(
        allPasswordEntries.map(async (entry) => {
          const encryptedPassword = entry.encryptedPassword;
          const iv = entry.iv;
          if (!encryptedPassword || !iv) {
            console.error('Encrypted password or IV is missing.');
            return;
          }
          const decryptedPassword = await this.cryptoService.decryptPassword(
            this.cryptoService.base64ToArrayBuffer(encryptedPassword),
            this.cryptoService.base64ToArrayBuffer(iv)
          );
          return { ...entry, decryptedPassword };
        })
      );

      const {
        recoveryKey,
        recoveryIVBase64,
        encryptedMasterKeyWithRecoveryBase64,
        masterPasswordSaltBase64,
      } = await this.cryptoService.handleMasterPasswordCreation(newMasterPassword);

      await firstValueFrom(
        this.masterPasswordHttpService.updateMasterPassword({
          recoveryIV: recoveryIVBase64,
          encryptedMasterKeyWithRecovery: encryptedMasterKeyWithRecoveryBase64,
          masterPasswordSalt: masterPasswordSaltBase64,
        })
      );

      this.cryptoService.downloadRecoveryKey(
        recoveryKey,
        this.authService.get_session_user()?.email ?? ''
      );

      const reEncryptedEntriesPromises = decryptedEntries.map(async (entry) => {
        if (!entry) return;
        const { encrypted, iv } = await this.cryptoService.encryptPassword(entry.decryptedPassword);
        return {
          ...entry,
          encryptedPassword: this.cryptoService.arrayBufferToBase64(encrypted),
          iv: this.cryptoService.arrayBufferToBase64(iv),
        };
      });
      console.log(
        '🚀 ~ MasterPasswordRecoveryPage ~ updateMasterKey ~ reEncryptedEntriesPromises:',
        reEncryptedEntriesPromises
      );
    } catch (error) {
      console.error('Error updating master key:', error);
    }
  }
}
