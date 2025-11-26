import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { IconError } from '../../../../core/icons/icon-error/icon-error';
import { IconWarn } from '../../../../core/icons/icon-warn/icon-warn';
import { IconCheck } from '../../../../core/icons/icon-check/icon-check';
import { IconShield } from '../../../../core/icons/icon-shield/icon-shield';
import { TPasswordStrength } from '../../../password-generator/types/password-generator.type';
import { PasswordGeneratorService } from '../../../password-generator/services/password-generator-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-password-strength',
  imports: [IconError, IconWarn, IconCheck, IconShield, NgClass],
  templateUrl: './password-strength.html',
  styleUrl: './password-strength.css',
})
export class PasswordStrength {
  private passwordService = inject(PasswordGeneratorService);

  @Input() password: string | null = '';

  passwordStrength: TPasswordStrength = 'medium';
  timeToCrack: string = '1 day';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['password']) {
      const { strength, timeToCrack } = this.passwordService.evaluatePasswordStrength(
        this.password!
      );
      this.passwordStrength = strength;
      this.timeToCrack = timeToCrack;
    }
  }

  get strengthClass(): string {
    return `strength-${this.passwordStrength}`;
  }
}
