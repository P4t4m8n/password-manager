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
import { IPasswordEntryDto } from '../../../password-entry/interfaces/passwordEntry';
import { MasterPasswordSaltSessionService } from '../../services/master-password-salt-session-service';

@Component({
  selector: 'app-master-password-recovery-page',
  imports: [ReactiveFormsModule],
  templateUrl: './master-password-recovery-page.html',
  styleUrl: './master-password-recovery-page.css',
})
export class MasterPasswordRecoveryPage implements OnInit {
  private masterPasswordHttpService = inject(MasterPasswordHttpService);
  private formBuilder = inject(FormBuilder);
  private _cryptoService = inject(CryptoService);
  private authService = inject(AuthService);
  private masterPasswordDialogService = inject(MasterPasswordDialogService);
  private confirmationDialogService = inject(ConfirmationDialogService);
  private passwordEntryHttpService = inject(PasswordEntryHttpService);
  private showMasterPasswordService = inject(ShowMasterPasswordDialogService);
  private masterPasswordSaltSessionService = inject(MasterPasswordSaltSessionService);

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
    const recoveryKey = this._cryptoService.base64ToArrayBuffer(this.recoveryKeyControl.value);
    const recoveryIV = this._cryptoService.base64ToArrayBuffer(this.recoveryData.recoveryIV);
    const encryptedMasterKeyWithRecovery = this._cryptoService.base64ToArrayBuffer(
      this.recoveryData.encryptedMasterKeyWithRecovery
    );

    const masterPassword = await this._cryptoService.decryptMasterKeyWithRecovery(
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
    await this.updateMasterKey(masterPassword, newMasterPassword);
  }

  async updateMasterKey(oldMasterPassword: string, newMasterPassword: string) {
    try {
      if (!this.masterPasswordSaltSessionService.checkSaltInitialized()) {
        throw new Error('Master password salt is missing in session.');
      }

      const saltBuffer = this._cryptoService.base64ToArrayBuffer(
        this.masterPasswordSaltSessionService.currentSalt!
      );

      await this._cryptoService.deriveMasterEncryptionKey({
        masterPassword: oldMasterPassword,
        saltBuffer,
      });

      const { data: allPasswordEntries } = await firstValueFrom(
        this.passwordEntryHttpService.get()
      );

      const decryptedEntries = await Promise.all(
        allPasswordEntries.map(async (entry) => {
          const encryptedPassword = entry.encryptedPassword;
          const iv = entry.iv;
          if (!encryptedPassword || !iv) {
            console.error('Encrypted password or IV is missing.');
            return;
          }
          const decryptedPassword = await this._cryptoService.decryptPassword(
            encryptedPassword,
            iv
          );
          return { ...entry, decryptedPassword };
        })
      );
      console.log(
        '🚀 ~ MasterPasswordRecoveryPage ~ updateMasterKey ~ decryptedEntries:',
        decryptedEntries
      );

      const {
        recoveryKey,
        recoveryIVBase64,
        encryptedMasterKeyWithRecoveryBase64,
        masterPasswordSaltBase64,
      } = await this._cryptoService.handleMasterPasswordCreation(newMasterPassword);

      await firstValueFrom(
        this.masterPasswordHttpService.updateMasterPassword({
          recoveryIV: recoveryIVBase64,
          encryptedMasterKeyWithRecovery: encryptedMasterKeyWithRecoveryBase64,
          masterPasswordSalt: masterPasswordSaltBase64,
        })
      );

      this._cryptoService.downloadRecoveryKey(
        recoveryKey,
        this.authService.get_session_user()?.email ?? ''
      );

      const reEncryptedEntriesPromises = decryptedEntries.map(async (entry) => {
        if (!entry) return;
        const { encrypted, iv } = await this._cryptoService.encryptPassword(
          entry.decryptedPassword
        );
        return {
          ...entry,
          encryptedPassword: this._cryptoService.arrayBufferToBase64(encrypted),
          iv: this._cryptoService.arrayBufferToBase64(iv),
        };
      });

      const reEncryptedEntries: IPasswordEntryDto[] = (
        await Promise.all(reEncryptedEntriesPromises)
      ).map((entry) => ({
        id: entry?.id,
        entryName: entry?.entryName,
        websiteUrl: entry?.websiteUrl,
        entryUserName: entry?.entryUserName,
        encryptedPassword: entry?.encryptedPassword,
        iv: entry?.iv,
        notes: entry?.notes,
      }));

      this.passwordEntryHttpService.updateAfterRecovery(reEncryptedEntries).subscribe({
        next: () => {
          console.log('Password entries updated successfully after master password recovery.');
        },
        error: (error) => {
          console.error('Error updating password entries after master password recovery:', error);
        },
      });
    } catch (error) {
      console.error('Error updating master key:', error);
    }
  }
}
