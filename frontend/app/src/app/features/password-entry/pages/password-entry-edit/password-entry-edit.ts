import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';

import { CryptoService } from '../../../crypto/services/crypto.service';
import { ErrorService } from '../../../../core/services/error-service';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { PasswordGeneratorDialogService } from '../../../password-generator/services/password-generator-dialog-service';

import { RevelInputPasswordDirective } from '../../../../core/directives/revel-input-password-directive';

import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { IconPasswordGenerator } from '../../../../core/icons/icon-password-generator/icon-password-generator';

import type { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { Header } from "../../../../core/layout/header/header";

@Component({
  selector: 'app-password-entry-edit',
  imports: [
    RevelInputPasswordDirective,
    ReactiveFormsModule,
    IconEye,
    IconPasswordGenerator,
    Header
],
  templateUrl: './password-entry-edit.html',
  styleUrl: './password-entry-edit.css',
})
export class PasswordEntryEdit {
  #formBuilder = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  #cryptoService = inject(CryptoService);
  #passwordEntryHttpService = inject(PasswordEntryHttpService);
  #passwordGeneratorDialogService = inject(PasswordGeneratorDialogService);
  #errorService = inject(ErrorService);

  #originalPasswordForUpdateCheck: string | null = null;

  passwordEntryFormGroup = this.#formBuilder.group({
    entryName: [''],
    websiteUrl: [''],
    entryUserName: [''],
    password: [''],
    notes: [''],
    id: [''],
  });

  ngOnInit() {
    this.#route.params
      .pipe(
        map((params) => params['entryId']),
        filter((id) => !!id),
        switchMap((entryId) => this.#passwordEntryHttpService.getById(entryId)),
        switchMap(async (entry) => {
          const decryptedPassword = await this.#cryptoService.decryptPassword(
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
          this.#originalPasswordForUpdateCheck = decryptedPassword;
        },
        error: (err) => {
          this.#errorService.handleError(err, { showErrorDialog: true });
        },
      });
  }

  async onPasswordGenerated() {
    const password = (await this.#passwordGeneratorDialogService.openDialog()) ?? '';
    this.passwordEntryFormGroup.patchValue({
      password: password,
    });
  }

  async onSubmit() {
    try {
      const { entryName, websiteUrl, entryUserName, password, notes, id } =
        this.passwordEntryFormGroup.value;

      if (!password) {
        throw new Error('Password is required');
      }

      const isPasswordChanged = password !== this.#originalPasswordForUpdateCheck;

      let passwordEntryDto: IPasswordEntryDto = {
        entryName: entryName || '',
        websiteUrl: websiteUrl || '',
        entryUserName: entryUserName || '',
        notes: notes || '',
        id: id || '',
      };

      if (isPasswordChanged) {
        const { encrypted, iv } = await this.#cryptoService.encryptPassword(password);

        passwordEntryDto.encryptedPassword = this.#cryptoService.arrayBufferToBase64(encrypted);
        passwordEntryDto.iv = this.#cryptoService.arrayBufferToBase64(iv);
      }

      this.#passwordEntryHttpService.save(passwordEntryDto).subscribe({
        next: (res) => {
          this.#router.navigate(['/entries/details', res.data.id]);
        },
      });
    } catch (error) {
      this.#errorService.handleError(error, {
        showToast: true,
        formGroup: this.passwordEntryFormGroup,
      });
    }
  }

  onCancel() {
    this.#router.navigate(['/entries']);
  }
}
