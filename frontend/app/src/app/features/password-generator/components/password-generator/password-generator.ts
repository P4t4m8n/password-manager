import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';

import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';
import { PasswordGeneratorService } from '../../services/password-generator-service';
import { IconWarn } from '../../../../core/icons/icon-warn/icon-warn';
import { IconCheck } from '../../../../core/icons/icon-check/icon-check';
import { IconShield } from '../../../../core/icons/icon-shield/icon-shield';
import { IconError } from '../../../../core/icons/icon-error/icon-error';

import { TPasswordStrength } from '../../types/password-generator.type';
import { ClipboardService } from '../../../../core/services/clipboard-service';

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

  private passwordService = inject(PasswordGeneratorService);
  private formBuilder = inject(FormBuilder);
  private clipboardService = inject(ClipboardService);

  public passwordStrength: TPasswordStrength = 'medium';
  public timeToCrack: string = '1 day';

  checkboxInputs = [
    { label: 'Lowercase Letters', formControlName: 'includesLowercase' },
    { label: 'Uppercase Letters', formControlName: 'includeUppercase' },
    { label: 'Numbers', formControlName: 'includeNumbers' },
    { label: 'Symbols', formControlName: 'includeSymbols' },
    { label: 'Similar Characters', formControlName: 'includeSimilarCharacters' },
  ];

  passwordGeneratorFormGroup = this.formBuilder.group({
    passwordLength: [12],
    includeSymbols: [true],
    includeNumbers: [true],
    includeUppercase: [true],
    includeSimilarCharacters: [false],
    includesLowercase: [true],
  });

  passwordControl = this.formBuilder.control('');

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

    this.passwordControl.setValue(password, { emitEvent: false });

    const { strength, timeToCrack } = this.passwordService.evaluatePasswordStrength(password);
    this.passwordStrength = strength as TPasswordStrength;
    this.timeToCrack = timeToCrack;
  }

  async copyToClipboard() {
    try {
      const password = this.passwordControl.value;
      await this.clipboardService.copyToClipboard(password);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  }

  emitPasswordSelected() {
    const password = this.passwordControl.value;
    if (password) {
      this.passwordSelected.emit(password);
    }
  }

  emitDialogClosed() {
    this.dialogClosed.emit();
  }
}
