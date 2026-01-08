import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';
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
  #passwordEvaluatorService = inject(PasswordEvaluatorService);
  #router = inject(Router);
  @Input() passwordEntries: Array<IPasswordEntryDto> = [];
  @Output() numberOfAttentionPasswordsEvent = new EventEmitter<number>();

  #passwordSaftyDashboard = new BehaviorSubject([
    {
      label: 'Total',
      value: 0,
    },
    {
      label: 'Weak',
      value: 0,
    },
    {
      label: 'Duplicate',
      value: 0,
    },
    {
      label: 'Old',
      value: 0,
    },
  ]);
  public passwordSaftyDashboard$ = this.#passwordSaftyDashboard.asObservable();

  #passwordEntriesEvaluated = new BehaviorSubject<Array<IPasswordEntryEvaluated>>([]);
  public passwordEntriesEvaluated$ = this.#passwordEntriesEvaluated.asObservable();

  #score = new BehaviorSubject<number>(0);
  public score$ = this.#score.asObservable();

  #hostElementRef = inject(ElementRef);

  async ngOnInit() {
    const passwordEntriesEvaluated = await this.#passwordEvaluatorService.evaluatePasswordsSafety(
      this.passwordEntries
    );
    this.#passwordEntriesEvaluated.next(passwordEntriesEvaluated);

    const numberOfAttentionPasswords =
      this.#passwordEvaluatorService.getNumberOfAttentionPasswords(passwordEntriesEvaluated);
    this.numberOfAttentionPasswordsEvent.emit(numberOfAttentionPasswords);

    this.#passwordSaftyDashboard.next(
      this.#passwordEvaluatorService.getPasswordSaftyDashboardValues(passwordEntriesEvaluated)
    );

    this.#score.next(
      this.#passwordEvaluatorService.calculateTotalPassowrdSafetyScrore(passwordEntriesEvaluated)
    );
  }

  getScoreValueText(): string {
    const score = this.#score.getValue();
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

  ngOnDestroy(): void {
    this.#passwordSaftyDashboard.complete();
  }
}
