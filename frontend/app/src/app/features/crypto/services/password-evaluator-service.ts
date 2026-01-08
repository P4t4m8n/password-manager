import { inject, Injectable } from '@angular/core';

import { CryptoService } from './crypto-service';
import { AbstractGlobalStateService } from '../../../core/abstracts/abstract-global-state-service.abstract';

import { PASSWORD_STRENGTH_LEVELS } from '../const/password.const';

import type { IPasswordEvaluation } from '../interfaces/passwords-evaluation.interface';
import type { TPasswordStrengthLevel } from '../types/password.types';
import type {
  IPasswordEntryEvaluated,
  IPasswordEntryDto,
} from '../../password-entry/interfaces/passwordEntry';

interface IPasswordEvaluateStrengthReturn {
  strength: TPasswordStrengthLevel;
  timeToCrack: string;
}
@Injectable({
  providedIn: 'root',
})
export class PasswordEvaluatorService extends AbstractGlobalStateService<IPasswordEvaluation> {
  public readonly PASSWORD_STRENGTH_EVALUATE = PASSWORD_STRENGTH_LEVELS;
  public readonly LETTERS_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  public readonly LETTERS_UPPERCASE = this.LETTERS_LOWERCASE.toUpperCase();
  public readonly NUMBERS = '0123456789';
  public readonly SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?/`~';
  public readonly COMMON_PASSWORDS = [
    '123456',
    'password',
    '123456789',
    '12345',
    '12345678',
    'qwerty',
    'abc123',
    'master',
    'admin',
  ];

  #cryptoService = inject(CryptoService);

  public getPasswordEvaluator(): IPasswordEvaluation | null {
    return this.getState();
  }

  public async handlePasswordsEvaluation(
    passwordEntries: Array<IPasswordEntryDto>
  ): Promise<Array<IPasswordEntryEvaluated>> {
    const passwordEntriesEvaluated = await this.evaluatePasswordsSafety(passwordEntries);

    const numberOfAttentionPasswords = this.getNumberOfAttentionPasswords(passwordEntriesEvaluated);

    const passwordSafetyDashboardValues =
      this.getPasswordSaftyDashboardValues(passwordEntriesEvaluated);
    const totalScore = this.calculateTotalPassowrdSafetyScrore(passwordEntriesEvaluated);

    this.updateState({
      totalScore,
      numberOfAttentionPasswords,
      passwordSafetyDashboardValues,
    });

    return passwordEntriesEvaluated;
  }

  public async evaluatePasswordsSafety(
    passwordEntries: Array<IPasswordEntryDto>
  ): Promise<Array<IPasswordEntryEvaluated>> {
    const evalautionPromises: Promise<IPasswordEntryEvaluated>[] = passwordEntries.map(
      async (entry) => {
        const encryptedPassword = entry.encryptedPassword;
        const iv = entry.iv;
        const decryptedPassword = await this.#cryptoService.decryptPassword(encryptedPassword, iv);

        const { strength, timeToCrack } = this.evaluatePasswordStrength(decryptedPassword);
        const lastChangeStrength = this.evaluteLastChangeStrength(entry.updatedAt);

        return {
          passwordEntry: { ...entry },
          strength,
          timeToCrack,
          lastChange: entry.updatedAt ?? entry.createdAt ?? new Date(),
          lastChangeStrength,
          duplicated: 0,
        };
      }
    );

    const evalutedPasswordsSafety = await Promise.all(evalautionPromises);

    // Calculate duplicates
    const passwordCountMap: Record<string, number> = {};

    evalutedPasswordsSafety.forEach((evaluated) => {
      const encryptedPassword = evaluated.passwordEntry.encryptedPassword!;
      passwordCountMap[encryptedPassword] = (passwordCountMap[encryptedPassword] || 0) + 1;
    });

    evalutedPasswordsSafety.forEach((evaluated) => {
      const encryptedPassword = evaluated.passwordEntry.encryptedPassword!;
      evaluated.duplicated = passwordCountMap[encryptedPassword] - 1 || 0;
    });

    return evalutedPasswordsSafety;
  }

  public getNumberOfAttentionPasswords(
    evalutedPasswordsSafety: Array<IPasswordEntryEvaluated>
  ): number {
    return evalutedPasswordsSafety.filter(
      (evaluated) =>
        evaluated.strength === 'weak' ||
        evaluated.duplicated > 1 ||
        evaluated.lastChangeStrength === 'weak'
    ).length;
  }

  public getPasswordSaftyDashboardValues(
    evalutedPasswordsSafety: Array<IPasswordEntryEvaluated>
  ): Array<{ label: string; value: number }> {
    const MS_IN_A_DAY = 1000 * 60 * 60 * 24;
    const MAX_AGE_DAYS = 180;

    const numberOfOldPasswords = evalutedPasswordsSafety.filter((p) => {
      const lastChangeDate =
        typeof p.lastChange === 'string' ? new Date(p.lastChange) : p.lastChange;
      const diffInMs = new Date().getTime() - lastChangeDate.getTime();
      const diffInDays = diffInMs / MS_IN_A_DAY;
      return diffInDays > MAX_AGE_DAYS;
    }).length;

    return [
      {
        label: 'Total',
        value: evalutedPasswordsSafety.length,
      },
      {
        label: 'Weak',
        value: evalutedPasswordsSafety.filter((p) => p.strength === 'weak').length,
      },
      {
        label: 'Duplicate',
        value: evalutedPasswordsSafety.filter((p) => p.duplicated > 0).length,
      },
      {
        label: 'Old',
        value: numberOfOldPasswords,
      },
    ];
  }

  public calculateTotalPassowrdSafetyScrore(
    evaluatedPasswords: Array<IPasswordEntryEvaluated>
  ): number {
    const scoreMap: Record<TPasswordStrengthLevel, number> = {
      veryStrong: 20,
      strong: 10,
      medium: 5,
      weak: 0,
    };

    const duplicatiopnPenalty = 5;
    const maxPerEntry = 40;
    const minimumValue = 0;
    const maximumValue = 100;

    const totalScore = evaluatedPasswords.reduce((acc, curr) => {
      return (
        acc +
        scoreMap[curr.strength] +
        scoreMap[curr.lastChangeStrength] -
        curr.duplicated * duplicatiopnPenalty
      );
    }, minimumValue);

    const maxPossibleScore = evaluatedPasswords.length * maxPerEntry;
    const normalizedScore =
      maxPossibleScore > minimumValue
        ? Math.floor((totalScore / maxPossibleScore) * 100)
        : minimumValue;

    return Math.max(minimumValue, Math.min(maximumValue, normalizedScore));
  }

  public evaluatePasswordStrength(password: string): IPasswordEvaluateStrengthReturn {
    if (!password || password.length === 0 || this.#isCommonPassword(password)) {
      return { strength: 'weak', timeToCrack: 'instant' };
    }

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(
      Boolean
    ).length;
    const length = password.length;

    let poolSize = 0;
    if (hasLowercase) poolSize += this.LETTERS_LOWERCASE.length;
    if (hasUppercase) poolSize += this.LETTERS_UPPERCASE.length;
    if (hasNumbers) poolSize += this.NUMBERS.length;
    if (hasSymbols) poolSize += this.SYMBOLS.length;

    const entropy = length * Math.log2(poolSize);
    const strength = this.#getStrengthKey(length, varietyCount, entropy);
    const timeToCrack = this.#getTimeToCrack(strength, entropy);

    return { strength, timeToCrack };
  }

  public evaluteLastChangeStrength(lastChange?: Date | string): TPasswordStrengthLevel {
    if (!lastChange) return 'veryStrong';
    const now = new Date();
    const lastChangeDate = typeof lastChange === 'string' ? new Date(lastChange) : lastChange;
    const diffInMs = now.getTime() - lastChangeDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInDays > 180) return 'weak';
    if (diffInDays > 90) return 'medium';
    if (diffInDays > 30) return 'strong';
    return 'veryStrong';
  }

  #getStrengthKey(length: number, varietyCount: number, entropy: number): TPasswordStrengthLevel {
    if (length < 8 || varietyCount < 2) return 'weak';
    if (length < 12 || varietyCount < 3 || entropy < 50) return 'medium';
    if (length < 16 || varietyCount < 4 || entropy < 80) return 'strong';
    return 'veryStrong';
  }

  #getTimeToCrack(strength: TPasswordStrengthLevel, entropy: number): string {
    switch (strength) {
      case 'weak':
        return entropy < 28 ? 'instant' : entropy < 36 ? 'few seconds' : 'few minutes';
      case 'medium':
        return entropy < 50 ? 'few hours' : entropy < 60 ? 'few days' : 'few weeks';
      case 'strong':
        return entropy < 70 ? 'few months' : entropy < 80 ? 'few years' : 'decades';
      case 'veryStrong':
        return entropy < 100
          ? 'centuries'
          : entropy < 128
          ? 'millennia'
          : 'beyond human comprehension';
    }
  }

  #isCommonPassword(password: string): boolean {
    return this.COMMON_PASSWORDS.includes(password);
  }
}
