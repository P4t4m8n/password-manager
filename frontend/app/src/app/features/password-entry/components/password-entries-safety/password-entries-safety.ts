import { Component, inject, Input } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { IconSafety } from '../../../../core/icons/icon-safety/icon-safety';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { PasswordEntriesSafetyDialogService } from '../../services/password-entries-safety-dialog-service';
import { MainLayoutRefService } from '../../../../core/services/main-layout-ref-service';
import { PasswordEvaluatorService } from '../../../crypto/services/password-evaluator-service';

@Component({
  selector: 'app-password-entries-safety',
  imports: [AsyncPipe, IconSafety],
  templateUrl: './password-entries-safety.html',
  styleUrl: './password-entries-safety.css',
})
export class PasswordEntriesSafety {
  @Input() passwordEntries: Array<IPasswordEntryDto> = [];

  #passwordEntriesSafetyDialogService = inject(PasswordEntriesSafetyDialogService);
  #layoutService = inject(MainLayoutRefService);
  #passwordEvaluatorService = inject(PasswordEvaluatorService);

  public evaluation$ = this.#passwordEvaluatorService.state$;

  onOpenDialog(event: Event) {
    event.stopPropagation();

    this.#passwordEntriesSafetyDialogService.openDialog(
      { passwordEntries: this.passwordEntries },
      this.#layoutService.getMainContent()
    );
  }
}
