import { Component, inject, Input, outputBinding } from '@angular/core';
import { IconSafety } from '../../../../core/icons/icon-safety/icon-safety';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
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

  #numberOfAttentionPasswords = new BehaviorSubject<number>(-1);
  public numberOfAttentionPasswords$ = this.#numberOfAttentionPasswords.asObservable();

  onEvaluatePasswordsSafety(event: Event) {
    event.stopPropagation();

    this.#passwordEntriesSafetyTableDialogService.openDialog(
      { passwordEntries: this.passwordEntries },
      this.#layoutService.getMainContent(),
      [
        outputBinding('numberOfAttentionPasswordsEvent', (amount: number) => {
          this.#numberOfAttentionPasswords.next(amount);
        }),
      ]
    );
  }
}
