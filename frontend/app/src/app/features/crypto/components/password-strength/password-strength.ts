import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';

import { PasswordGeneratorService } from '../../../password-generator/services/password-generator-service';

import { IconError } from '../../../../core/icons/icon-error/icon-error';
import { IconWarn } from '../../../../core/icons/icon-warn/icon-warn';
import { IconCheck } from '../../../../core/icons/icon-check/icon-check';
import { IconShield } from '../../../../core/icons/icon-shield/icon-shield';

import { ExtendedTitleCasePipePipe } from '../../../../core/pipes/extended-title-case-pipe-pipe';
import { TPasswordStrength } from '../../services/password-evaluator.service';

@Component({
  selector: 'app-password-strength',
  imports: [IconError, IconWarn, IconCheck, IconShield, NgClass, ExtendedTitleCasePipePipe],
  templateUrl: './password-strength.html',
  styleUrl: './password-strength.css',
})
export class PasswordStrength {
  #passwordGeneratorService = inject(PasswordGeneratorService);

  @Input() password: string | null = '';

  passwordStrength: TPasswordStrength = 'medium';
  timeToCrack: string = '1 day';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['password']) {
      const { strength, timeToCrack } = this.#passwordGeneratorService.evaluatePasswordStrength(
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
