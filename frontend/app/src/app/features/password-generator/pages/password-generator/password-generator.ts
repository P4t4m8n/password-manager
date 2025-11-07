import { Component, inject, signal } from '@angular/core';
import { TPasswordStrength } from '../../types/password-generator.type';
import { FormBuilder, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { IconCopyPassword } from "../../../../core/icons/icon-copy-password/icon-copy-password";

@Component({
  selector: 'app-password-generator',
  imports: [ɵInternalFormsSharedModule, IconCopyPassword, ReactiveFormsModule],
  templateUrl: './password-generator.html',
  styleUrl: './password-generator.css',
})
export class PasswordGenerator {
  passwordStrength: TPasswordStrength = 'medium';

  passwordLength: number = 12;
  includeSymbols: boolean = true;
  includeNumbers: boolean = true;
  includeMixCase: boolean = true;
  includeSimilarCharacters: boolean = false;
  includesLetters: boolean = true;

  timeToCrack: string = '1 day';

  password = signal('');

  private formBuilder = inject(FormBuilder);

  passwordGeneratorFormGroup = this.formBuilder.group({
    passwordLength: [12],
    includeSymbols: [true],
    includeNumbers: [true],
    includeMixCase: [true],
    includeSimilarCharacters: [false],
    includesLetters: [true],
    password: [''],
  });
}
