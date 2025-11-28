import { Component, inject } from '@angular/core';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { PasswordGeneratorDialog } from '../../../password-generator/components/password-generator-dialog/password-generator-dialog';
import { RevelInputPasswordDirective } from '../../../../core/directives/revel-input-password-directive';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { BackButton } from '../../../../core/components/back-button/back-button';

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
  private _formBuilder = inject(FormBuilder);
  private _cryptoService = inject(CryptoService);
  private _passwordEntryHttpService = inject(PasswordEntryHttpService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  private _originalPasswordForUpdateCheck: string | null = null;

  passwordEntryFormGroup = this._formBuilder.group({
    entryName: [''],
    websiteUrl: [''],
    entryUserName: [''],
    password: [''],
    notes: [''],
    id: [''],
  });

  ngOnInit() {
    this._route.params
      .pipe(
        map((params) => params['entryId']),
        filter((id) => !!id),
        switchMap((entryId) => this._passwordEntryHttpService.getById(entryId)),
        switchMap(async (entry) => {
          const decryptedPassword = await this._cryptoService.decryptPassword(
            entry.encryptedPassword,
            entry.iv
          );

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
          this._originalPasswordForUpdateCheck = decryptedPassword;
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

      const isPasswordChanged = password !== this._originalPasswordForUpdateCheck;
      console.log('originalPasswordForUpdateCheck:', this._originalPasswordForUpdateCheck);
      console.log('password:', password);
      console.log('isPasswordChanged:', isPasswordChanged);

      let passwordEntryDto: IPasswordEntryDto = {
        entryName: entryName || '',
        websiteUrl: websiteUrl || '',
        entryUserName: entryUserName || '',
        notes: notes || '',
        id: id || '',
      };

      if (isPasswordChanged) {
        const { encrypted, iv } = await this._cryptoService.encryptPassword(password);

        passwordEntryDto.encryptedPassword = this._cryptoService.arrayBufferToBase64(encrypted);
        passwordEntryDto.iv = this._cryptoService.arrayBufferToBase64(iv);
      }

      this._passwordEntryHttpService.save(passwordEntryDto).subscribe({
        next: (res) => {
          this._router.navigate(['/entries/details', res.data.id]);
        },
        error: (err) => {
          throw err;
        },
      });
    } catch (error) {
      console.error('Error saving password entry', error);
    }
  }

  onCancel() {
    this._router.navigate(['/entries']);
  }
}
