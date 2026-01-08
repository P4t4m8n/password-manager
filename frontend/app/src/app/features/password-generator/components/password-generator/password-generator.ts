import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardService } from '../../../../core/services/clipboard-service';
import { PasswordGeneratorService } from '../../services/password-generator-service';

import { PasswordStrength } from '../../../crypto/components/password-strength/password-strength';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';

import type { TPasswordStrengthLevel } from '../../../crypto/types/password.types';

@Component({
  selector: 'app-password-generator',
  imports: [ɵInternalFormsSharedModule, IconCopyPassword, ReactiveFormsModule, PasswordStrength],
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

  public passwordStrength: TPasswordStrengthLevel = 'medium';
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

  get passwordLength() {
    return this.passwordGeneratorFormGroup.get('passwordLength')?.value;
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
    this.passwordStrength = strength;
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
