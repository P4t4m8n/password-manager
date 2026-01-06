import { Injectable } from '@angular/core';

const PASSWORD_STRENGTH = ['weak', 'medium', 'strong', 'veryStrong'] as const;
export type TPasswordStrength = (typeof PASSWORD_STRENGTH)[number];

@Injectable({
  providedIn: 'root',
})
export class PasswordEvaluator {
  public readonly PASSWORD_STRENGTH_EVALUATE = PASSWORD_STRENGTH;
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

  public evaluatePasswordStrength(password: string): {
    strength: TPasswordStrength;
    timeToCrack: string;
  } {
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

  #getStrengthKey(length: number, varietyCount: number, entropy: number): TPasswordStrength {
    if (length < 8 || varietyCount < 2) return 'weak';
    if (length < 12 || varietyCount < 3 || entropy < 50) return 'medium';
    if (length < 16 || varietyCount < 4 || entropy < 80) return 'strong';
    return 'veryStrong';
  }

  #getTimeToCrack(strength: TPasswordStrength, entropy: number): string {
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
