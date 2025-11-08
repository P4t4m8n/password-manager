import { Component, inject } from '@angular/core';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconArrow } from '../../../../core/icons/icon-arrow/icon-arrow';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { IconPasswordGenerator } from '../../../../core/icons/icon-password-generator/icon-password-generator';
import { PasswordGeneratorDialog } from '../../../password-generator/components/password-generator-dialog/password-generator-dialog';
import { RevelInputPasswordDirective } from '../../../../core/directives/revel-input-password-directive';
import { CryptoService } from '../../../crypto/services/crypto.service';

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
  private cryptoService = inject(CryptoService)

  passwordEntryFormGroup = this.formBuilder.group({
    entryName: [''],
    websiteUrl: [''],
    entryUserName: [''],
    password: [''],
    notes: [''],
  });

  onPasswordGenerated(password: string) {
    this.passwordEntryFormGroup.patchValue({ password: password });
  }
}
