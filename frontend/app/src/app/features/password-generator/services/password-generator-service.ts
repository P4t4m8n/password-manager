import { inject, Injectable } from '@angular/core';
import { PasswordEvaluatorService } from '../../crypto/services/password-evaluator-service';

export interface IPasswordOptions {
  passwordLength: number | null;
  includeSymbols: boolean | null;
  includeNumbers: boolean | null;
  includeUppercase: boolean | null;
  includeSimilarCharacters: boolean | null;
  includesLowercase: boolean | null;
  password: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordGeneratorService {
  #passwordEvaluator = inject(PasswordEvaluatorService);
  buildCharacterPool(options: Partial<IPasswordOptions>): string {
    let pool = '';
    if (options.includesLowercase) pool += this.#passwordEvaluator.LETTERS_LOWERCASE;
    if (options.includeUppercase) pool += this.#passwordEvaluator.LETTERS_UPPERCASE;
    if (options.includeNumbers) pool += this.#passwordEvaluator.NUMBERS;
    if (options.includeSymbols) pool += this.#passwordEvaluator.SYMBOLS;
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

  evaluatePasswordStrength(password: string) {
    return this.#passwordEvaluator.evaluatePasswordStrength(password);
  }
}
