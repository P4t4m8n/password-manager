import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

import { ClipboardService } from '../../../../core/services/clipboard-service';
import { PasswordGeneratorService } from '../../services/password-generator-service';

import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';
import { IconWarn } from '../../../../core/icons/icon-warn/icon-warn';
import { IconCheck } from '../../../../core/icons/icon-check/icon-check';
import { IconShield } from '../../../../core/icons/icon-shield/icon-shield';
import { IconError } from '../../../../core/icons/icon-error/icon-error';

import type { TPasswordStrength } from '../../types/password-generator.type';

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

  #passwordService = inject(PasswordGeneratorService);
  #formBuilder = inject(FormBuilder);
  #clipboardService = inject(ClipboardService);

  public passwordStrength: TPasswordStrength = 'medium';
  public timeToCrack: string = '1 day';

  readonly checkboxInputs = [
    { label: 'Lowercase Letters', formControlName: 'includesLowercase' },
    { label: 'Uppercase Letters', formControlName: 'includeUppercase' },
    { label: 'Numbers', formControlName: 'includeNumbers' },
    { label: 'Symbols', formControlName: 'includeSymbols' },
    { label: 'Similar Characters', formControlName: 'includeSimilarCharacters' },
  ];

  passwordGeneratorFormGroup = this.#formBuilder.group({
    passwordLength: [12],
    includeSymbols: [true],
    includeNumbers: [true],
    includeUppercase: [true],
    includeSimilarCharacters: [false],
    includesLowercase: [true],
  });

  passwordControl = this.#formBuilder.control('');

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

      this.onGeneratePassword();
    });

    this.onGeneratePassword();
  }

  get strengthClass(): string {
    return `strength-${this.passwordStrength}`;
  }

  onGeneratePassword() {
    const formValue = this.passwordGeneratorFormGroup.value;
    const passwordLength = formValue.passwordLength ?? 12;
    const includeSimilarCharacters = formValue.includeSimilarCharacters ?? false;

    const characterPool = this.#passwordService.buildCharacterPool(formValue);
    const password = this.#passwordService.generatePassword(
      characterPool,
      passwordLength,
      includeSimilarCharacters
    );

    this.passwordControl.setValue(password, { emitEvent: false });

    const { strength, timeToCrack } = this.#passwordService.evaluatePasswordStrength(password);
    this.passwordStrength = strength as TPasswordStrength;
    this.timeToCrack = timeToCrack;
  }

  async onCopyToClipboard() {
    const password = this.passwordControl.value;
    await this.#clipboardService.copyToClipboard(password);
  }

  onEmitPasswordSelected() {
    const password = this.passwordControl.value;
    if (password) {
      this.passwordSelected.emit(password);
    }
  }

  onEmitDialogClosed() {
    this.dialogClosed.emit();
  }
}
