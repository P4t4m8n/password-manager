import { Injectable } from '@angular/core';
import {
  LETTERS_LOWERCASE,
  LETTERS_UPPERCASE,
  NUMBERS,
  SYMBOLS,
} from '../consts/password-generator-store.const';
import { TPasswordStrength } from '../types/password-generator.type';
import { IPasswordOptions } from '../interfaces/password-options.interface';

@Injectable({
  providedIn: 'root',
})
export class PasswordGeneratorService {
  buildCharacterPool(options: Partial<IPasswordOptions>): string {
    let pool = '';
    if (options.includesLowercase) pool += LETTERS_LOWERCASE;
    if (options.includeUppercase) pool += LETTERS_UPPERCASE;
    if (options.includeNumbers) pool += NUMBERS;
    if (options.includeSymbols) pool += SYMBOLS;
    return pool;
  }

  generatePassword(
    characterPool: string,
    length: number,
    includeSimilarCharacters: boolean
  ): string {
    let _characterPool = characterPool;

    return Array.from({ length }, () => {
      const randomIndex = Math.floor(Math.random() * _characterPool.length);
      const char = _characterPool[randomIndex];

      if (!includeSimilarCharacters) {
        _characterPool =
          _characterPool.substring(0, randomIndex) + _characterPool.substring(randomIndex + 1);
      }
      return char;
    }).join('');
  }

  evaluatePasswordStrength(password: string){
    if (!password) {
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
    if (hasLowercase) poolSize += LETTERS_LOWERCASE.length;
    if (hasUppercase) poolSize += LETTERS_UPPERCASE.length;
    if (hasNumbers) poolSize += NUMBERS.length;
    if (hasSymbols) poolSize += SYMBOLS.length;

    const entropy = length * Math.log2(poolSize);
    const strength = this.getStrengthKey(length, varietyCount, entropy);
    const timeToCrack = this.getTimeToCrack(strength, entropy);

    return { strength, timeToCrack };
  }

  

  private getStrengthKey(length: number, varietyCount: number, entropy: number): TPasswordStrength {
    if (length < 8 || varietyCount < 2) return 'weak';
    if (length < 12 || varietyCount < 3 || entropy < 50) return 'medium';
    if (length < 16 || varietyCount < 4 || entropy < 80) return 'strong';
    return 'very-strong';
  }

  private getTimeToCrack(strength: TPasswordStrength, entropy: number): string {
    switch (strength) {
      case 'weak':
        return entropy < 28 ? 'instant' : entropy < 36 ? 'few seconds' : 'few minutes';
      case 'medium':
        return entropy < 50 ? 'few hours' : entropy < 60 ? 'few days' : 'few weeks';
      case 'strong':
        return entropy < 70 ? 'few months' : entropy < 80 ? 'few years' : 'decades';
      case 'very-strong':
        return entropy < 100
          ? 'centuries'
          : entropy < 128
          ? 'millennia'
          : 'beyond human comprehension';
    }
  }
}
