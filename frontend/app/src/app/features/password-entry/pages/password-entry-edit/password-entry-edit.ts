import { Component, inject } from '@angular/core';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconArrow } from '../../../../core/icons/icon-arrow/icon-arrow';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { PasswordGeneratorDialog } from '../../../password-generator/components/password-generator-dialog/password-generator-dialog';
import { RevelInputPasswordDirective } from '../../../../core/directives/revel-input-password-directive';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { AuthService } from '../../../auth/services/auth.service';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { async, filter, map, switchMap } from 'rxjs';
import { PasswordEntryService } from '../../services/password-entry-service';
import { BackButton } from '../../../../core/components/back-button/back-button';
import { MasterPasswordDialogService } from '../../../master-password/services/master-password-dialog-service';

@Component({
  selector: 'app-password-entry-edit',
  imports: [
    RevelInputPasswordDirective,
    IconFavorite,
    ReactiveFormsModule,
    IconEye,
    PasswordGeneratorDialog,
    BackButton,
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
  private router = inject(Router);

  private originalPasswordForUpdateCheck: string | null = null;

  passwordEntryFormGroup = this.formBuilder.group({
    entryName: [''],
    websiteUrl: [''],
    entryUserName: [''],
    password: [''],
    notes: [''],
    id: [''],
  });

  ngOnInit() {
    this.route.params
      .pipe(
        map((params) => params['entryId']),
        filter((id) => !!id),
        switchMap((entryId) => this.passwordEntryHttpService.getById(entryId)),
        switchMap(async (entry) => {
          const decryptedPassword =
            (await this.passwordEntryService.decryptPassword({
              encryptedPassword: entry.encryptedPassword,
              iv: entry.iv,
            })) ?? '';

          return { entry, decryptedPassword };
        })
      )
      .subscribe({
        next: ({ entry, decryptedPassword }) => {
          this.passwordEntryFormGroup.patchValue({
            entryName: entry.entryName,
            websiteUrl: entry.websiteUrl,
            entryUserName: entry.entryUserName,
            password: decryptedPassword,
            notes: entry.notes,
            id: entry.id,
          });
          this.originalPasswordForUpdateCheck = decryptedPassword;
        },
        error: (err) => {
          console.error('Error loading password entry', err);
        },
      });
  }

  onPasswordGenerated(password: string) {
    this.passwordEntryFormGroup.patchValue({ password: password });
  }

  async onSubmit() {
    try {
      const { entryName, websiteUrl, entryUserName, password, notes, id } =
        this.passwordEntryFormGroup.value;

      if (!password) {
        console.error('Password is required.');
        return;
      }

      const isPasswordChanged = password !== this.originalPasswordForUpdateCheck;

      let passwordEntryDto: IPasswordEntryDto = {
        entryName: entryName || '',
        websiteUrl: websiteUrl || '',
        entryUserName: entryUserName || '',
        notes: notes || '',
        id: id || '',
      };

      if (isPasswordChanged) {
        await this.initializeEncryptionKeyIfNeeded();

        const { encrypted, iv } = await this.cryptoService.encryptPassword(password);

        passwordEntryDto.encryptedPassword = this.cryptoService.arrayBufferToBase64(encrypted);
        passwordEntryDto.iv = this.cryptoService.arrayBufferToBase64(iv);
      }

      this.passwordEntryHttpService.save(passwordEntryDto).subscribe({
        next: (res) => {
          this.router.navigate(['/entries/details', res.data.id]);
        },
        error: (err) => {
          throw err;
        },
      });
    } catch (error) {
      console.error('Error saving password entry', error);
    }
  }

  async initializeEncryptionKeyIfNeeded() {
    if (!this.cryptoService.checkEncryptionKeyInitialized()) return;
    const masterPassword = await this.dialogService.openDialogWithProps({ mode: 'unlock' });
    if (!masterPassword) {
      console.error('Master password is required to encrypt the password entry.');
      throw new Error('Master password is required to encrypt the password entry.');
    }
    const plainSalt = this.authService.get_master_password_salt();
    if (!plainSalt) {
      console.error('Master password salt is missing.');
      throw new Error('Master password salt is missing.');
    }

    const salt = this.cryptoService.base64ToArrayBuffer(plainSalt);
    await this.cryptoService.deriveMasterEncryptionKey({ masterPassword, salt });
  }

  onCancel() {
    this.router.navigate(['/entries']);
  }
}
