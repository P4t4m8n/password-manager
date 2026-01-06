import { Component, inject, Input } from '@angular/core';
import { IconSafety } from '../../../../core/icons/icon-safety/icon-safety';
import { IEvaluatedPasswordSafety, IPasswordEntryDto } from '../../interfaces/passwordEntry';
import {
  PasswordEvaluatorService,
  TPasswordStrength,
} from '../../../crypto/services/password-evaluator-service';
import { CryptoService } from '../../../crypto/services/crypto-service';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { PasswordEntriesSafetyTableDialogService } from '../../services/password-entries-safety-table-dialog-service';
import { MainLayoutRefService } from '../../../../core/services/main-layout-ref-service';

@Component({
  selector: 'app-password-entries-safety',
  imports: [IconSafety, AsyncPipe],
  templateUrl: './password-entries-safety.html',
  styleUrl: './password-entries-safety.css',
})
export class PasswordEntriesSafety {
  @Input() passwordEntries: Array<IPasswordEntryDto> = [];

  #passwordEntriesSafetyTableDialogService = inject(PasswordEntriesSafetyTableDialogService);
  #layoutService = inject(MainLayoutRefService);

  #evalutedPasswordsSafety = new BehaviorSubject<Array<IEvaluatedPasswordSafety>>([]);
  public evalutedPasswordsSafety$ = this.#evalutedPasswordsSafety.asObservable();

  #numberOfAttentionPasswords = new BehaviorSubject<number>(-1);
  public numberOfAttentionPasswords$ = this.#numberOfAttentionPasswords.asObservable();

  #passwordEvaluator = inject(PasswordEvaluatorService);
  #cryptoService = inject(CryptoService);

  async onEvaluatePasswordsSafety() {
    const evalautionPromises: Promise<IEvaluatedPasswordSafety>[] = this.passwordEntries.map(
      async (entry) => {
        const encryptedPassword = entry.encryptedPassword;
        const iv = entry.iv;
        const decryptedPassword = await this.#cryptoService.decryptPassword(encryptedPassword, iv);

        const { strength, timeToCrack } =
          this.#passwordEvaluator.evaluatePasswordStrength(decryptedPassword);

        return {
          passwordEntry: { ...entry },
          strength,
          timeToCrack,
          lastChange: entry.updatedAt ?? entry.createdAt ?? new Date(),
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
      evaluated.duplicated = passwordCountMap[encryptedPassword] || 0;
    });

    const numberOfAttantionPasswwods = evalutedPasswordsSafety.filter(
      (evaluated) => evaluated.strength === 'weak' || evaluated.duplicated > 1
    ).length;

    this.#numberOfAttentionPasswords.next(numberOfAttantionPasswwods);
    this.#evalutedPasswordsSafety.next(evalutedPasswordsSafety);

    this.#passwordEntriesSafetyTableDialogService.openDialog(
      {
        evalutedPasswordsSafety,
      },
      this.#layoutService.getMainContent()
    );
  }
}
