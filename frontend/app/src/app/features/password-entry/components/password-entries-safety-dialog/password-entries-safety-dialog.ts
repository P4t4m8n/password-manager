import { Component, ElementRef, HostListener, inject, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { PasswordEvaluatorService } from '../../../crypto/services/password-evaluator-service';

import { AbstractDialog } from '../../../../core/abstracts/dialog.abstract';
import { PasswordEntriesEvaluatedTable } from '../password-entry-evaluated-table/password-entry-evaluated-table';
import { IconCloseOpen } from '../../../../core/icons/icon-close-open/icon-close-open';

import type { IPasswordEntryEvaluated, IPasswordEntryDto } from '../../interfaces/passwordEntry';

@Component({
  selector: 'app-password-entries-safety-dialog',
  imports: [AsyncPipe, IconCloseOpen, PasswordEntriesEvaluatedTable],
  templateUrl: './password-entries-safety-dialog.html',
  styleUrl: './password-entries-safety-dialog.css',
})
export class PasswordEntriesSafetyDialog extends AbstractDialog<void> {
  @Input() passwordEntries: Array<IPasswordEntryDto> = [];

  #passwordEvaluatorService = inject(PasswordEvaluatorService);
  #router = inject(Router);
  #hostElementRef = inject(ElementRef);

  #passwordEntriesEvaluated = new BehaviorSubject<Array<IPasswordEntryEvaluated>>([]);
  public passwordEntriesEvaluated$ = this.#passwordEntriesEvaluated.asObservable();
  public evaluation$ = this.#passwordEvaluatorService.state$;

  async ngOnInit() {
    const passwordEntriesEvaluated = await this.#passwordEvaluatorService.handlePasswordsEvaluation(
      this.passwordEntries
    );

    this.#passwordEntriesEvaluated.next(passwordEntriesEvaluated);
  }

  getScoreValueText(score: number): string {
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  }

  emitNavigate(path: 'edit' | 'details', passwordEntryId?: string) {
    this.cancel();
    this.#router.navigate(['/entries', path, passwordEntryId]);
  }

  @HostListener('document:click', ['$event'])
  onHostClick(event: MouseEvent): void {
    if (!this.#hostElementRef.nativeElement.contains(event.target)) {
      this.cancel();
    }
  }
  override submit(): void {}
}
