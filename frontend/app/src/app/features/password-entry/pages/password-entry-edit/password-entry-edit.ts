import { Component, inject } from '@angular/core';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconArrow } from '../../../../core/icons/icon-arrow/icon-arrow';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { IconEye } from "../../../../core/icons/icon-eye/icon-eye";
import { IconPasswordGenerator } from "../../../../core/icons/icon-password-generator/icon-password-generator";

@Component({
  selector: 'app-password-entry-edit',
  imports: [IconFavorite, IconArrow, ReactiveFormsModule, IconEye, IconPasswordGenerator],
  templateUrl: './password-entry-edit.html',
  styleUrl: './password-entry-edit.css',
})
export class PasswordEntryEdit {
  private formBuilder = inject(FormBuilder);

  passwordEntryFormGroup = this.formBuilder.group({
    entryName: [''],
    websiteUrl: [''],
    entryUserName: [''],
    password: [''],
    notes: [''],
  });
}
