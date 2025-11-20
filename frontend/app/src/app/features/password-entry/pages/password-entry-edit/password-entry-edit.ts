import { Component, inject } from '@angular/core';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconArrow } from '../../../../core/icons/icon-arrow/icon-arrow';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { PasswordGeneratorDialog } from '../../../password-generator/components/password-generator-dialog/password-generator-dialog';
import { RevelInputPasswordDirective } from '../../../../core/directives/revel-input-password-directive';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { AuthService } from '../../../Auth/services/auth.service';
import { MasterPasswordDialogService } from '../../../crypto/master-password/services/master-password-dialog-service';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs';
import { PasswordEntryService } from '../../services/password-entry-service';

@Component({
  selector: 'app-password-entry-edit',
  imports: [
    RevelInputPasswordDirective,
    IconFavorite,
    IconArrow,
    ReactiveFormsModule,
    IconEye,
    PasswordGeneratorDialog,
  ],
  templateUrl: './password-entry-edit.html',
  styleUrl: './password-entry-edit.css',
})
export class PasswordEntryEdit {
  private formBuilder = inject(FormBuilder);
  private cryptoService = inject(CryptoService);
  private authService = inject(AuthService);
  private dialogService = inject(MasterPasswordDialogService);
  private passwordEntryHttpService = inject(PasswordEntryHttpService);
  private route = inject(ActivatedRoute);
  private passwordEntryService = inject(PasswordEntryService);

  passwordEntryFormGroup = this.formBuilder.group({
    entryName: [''],
    websiteUrl: [''],
    entryUserName: [''],
    password: [''],
    notes: [''],
  });

  ngOnInit() {
    this.route.params
      .pipe(
        map((params) => params['entryId']),
        filter((id) => id)
      )
      .subscribe((entryId: string) => {
        this.passwordEntryHttpService.getById(entryId).subscribe({
          next: async (entry) => {
            const decryptedPassword =
              (await this.passwordEntryService.decryptPassword({
                encryptedPassword: entry.encryptedPassword,
                iv: entry.iv,
              })) ?? '';

            this.passwordEntryFormGroup.patchValue({
              entryName: entry.entryName,
              websiteUrl: entry.websiteUrl,
              entryUserName: entry.entryUserName,
              password: decryptedPassword,
              notes: entry.notes,
            });
          },
        });
      });
  }

  onPasswordGenerated(password: string) {
    this.passwordEntryFormGroup.patchValue({ password: password });
  }

  async onSubmit() {
    const { entryName, websiteUrl, entryUserName, password, notes } =
      this.passwordEntryFormGroup.value;

    if (!password) {
      console.error('Password is required.');
      return;
    }
    if (!this.cryptoService.checkEncryptionKeyInitialized()) {
      const masterPassword = await this.dialogService.openMasterPasswordDialog();
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

    const encryptedPassword = await this.cryptoService.encryptPassword(password);
    console.log('Encrypted Password:', encryptedPassword);

    const passwordEntryDto: IPasswordEntryDto = {
      entryName: entryName || '',
      websiteUrl: websiteUrl || '',
      entryUserName: entryUserName || '',
      encryptedPassword: this.cryptoService.arrayBufferToBase64(encryptedPassword.encrypted),
      iv: this.cryptoService.arrayBufferToBase64(encryptedPassword.iv),
      notes: notes || '',
    };
    console.log('🚀 ~ PasswordEntryEdit ~ onSubmit ~ passwordEntryDto:', passwordEntryDto);
    this.passwordEntryHttpService.save(passwordEntryDto).subscribe({
      next: (res) => {
        console.log('Password entry saved successfully:', res);
      },
      error: (err) => {
        console.error('Error saving password entry:', err);
      },
    });
  }

  async initializeEncryptionKeyIfNeeded() {
    if (!this.cryptoService.checkEncryptionKeyInitialized()) {
      const masterPassword = await this.dialogService.openMasterPasswordDialog();
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
  }
}
