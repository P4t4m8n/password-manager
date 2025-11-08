import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { TPasswordStrength } from '../../types/password-generator.type';
import { FormBuilder, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';

import { PasswordGeneratorService } from '../../services/password-generator-service';
import { IconPlus } from '../../../../core/icons/icon-plus/icon-plus';
import { IconWarn } from '../../../../core/icons/icon-warn/icon-warn';
import { IconCheck } from '../../../../core/icons/icon-check/icon-check';
import { IconShield } from '../../../../core/icons/icon-shield/icon-shield';
import { IconError } from '../../../../core/icons/icon-error/icon-error';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-password-generator',
  imports: [
    ɵInternalFormsSharedModule,
    IconCopyPassword,
    ReactiveFormsModule,
    NgClass,
    IconWarn,
    IconCheck,
    IconShield,
    IconError,
  ],
  templateUrl: './password-generator.html',
  styleUrl: './password-generator.css',
})
export class PasswordGenerator implements OnInit {
  @Input() isDialog: boolean = false;
  @Output() passwordSelected = new EventEmitter<string>();
  @Output() dialogClosed = new EventEmitter<void>();

  passwordStrength: TPasswordStrength = 'medium';
  timeToCrack: string = '1 day';
  private passwordService = inject(PasswordGeneratorService);
  private formBuilder = inject(FormBuilder);

  checkboxInputs = [
    { label: 'Include Lowercase Letters', formControlName: 'includesLowercase' },
    { label: 'Include Uppercase Letters', formControlName: 'includeUppercase' },
    { label: 'Include Numbers', formControlName: 'includeNumbers' },
    { label: 'Include Symbols', formControlName: 'includeSymbols' },
    { label: 'Include Similar Characters', formControlName: 'includeSimilarCharacters' },
  ];

  passwordGeneratorFormGroup = this.formBuilder.group({
    passwordLength: [12],
    includeSymbols: [true],
    includeNumbers: [true],
    includeUppercase: [true],
    includeSimilarCharacters: [false],
    includesLowercase: [true],
    password: [''],
  });

  ngOnInit() {
    this.passwordGeneratorFormGroup.valueChanges.subscribe((value) => {
      const { includesLowercase, includeUppercase, includeNumbers, includeSymbols } = value;

      if (!includesLowercase && !includeUppercase && !includeNumbers && !includeSymbols) {
        this.passwordGeneratorFormGroup.patchValue(
          { includesLowercase: true },
          { emitEvent: false }
        );
        return;
      }

      this.generatePassword();
    });

    this.generatePassword();
  }

  get strengthClass(): string {
    return `strength-${this.passwordStrength}`;
  }

  generatePassword() {
    const formValue = this.passwordGeneratorFormGroup.value;
    const passwordLength = formValue.passwordLength ?? 12;
    const includeSimilarCharacters = formValue.includeSimilarCharacters ?? false;

    const characterPool = this.passwordService.buildCharacterPool(formValue);
    const password = this.passwordService.generatePassword(
      characterPool,
      passwordLength,
      includeSimilarCharacters
    );

    this.passwordGeneratorFormGroup.patchValue({ password }, { emitEvent: false });

    const { strength, timeToCrack } = this.passwordService.evaluatePasswordStrength(password);
    this.passwordStrength = strength as TPasswordStrength;
    this.timeToCrack = timeToCrack;
  }

  async copyToClipboard() {
    const password = this.passwordGeneratorFormGroup.value.password;

    if (!password) {
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  }

  emitPasswordSelected() {
    const password = this.passwordGeneratorFormGroup.value.password;
    if (password) {
      this.passwordSelected.emit(password);
    }
  }

  emitDialogClosed() {
    this.dialogClosed.emit();
  }
}
