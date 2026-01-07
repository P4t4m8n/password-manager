import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';
import { AbstractDialog } from '../../../../core/abstracts/dialog.abstract';
import { IEvaluatedPasswordSafety, IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { ShowPassword } from '../../../crypto/components/show-password/show-password';
import { TimeAgoPipePipe } from '../../../../core/pipes/time-ago-pipe-pipe';
import { IconCloseOpen } from '../../../../core/icons/icon-close-open/icon-close-open';
import { ExternalLink } from '../../../../core/components/external-link/external-link';
import { ExtendedTitleCasePipePipe } from '../../../../core/pipes/extended-title-case-pipe-pipe';
import {
  PasswordEvaluatorService,
  TPasswordStrength,
} from '../../../crypto/services/password-evaluator-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-password-entries-safety-table-dialog',
  imports: [
    AsyncPipe,
    ShowPassword,
    TimeAgoPipePipe,
    IconCloseOpen,
    ExternalLink,
    ExtendedTitleCasePipePipe,
    NgClass,
  ],
  templateUrl: './password-entries-safety-table-dialog.html',
  styleUrl: './password-entries-safety-table-dialog.css',
})
export class PasswordEntriesSafetyTableDialog extends AbstractDialog<void> {
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

  #evaluatedPasswords = new BehaviorSubject<Array<IEvaluatedPasswordSafety>>([]);
  public evaluatedPasswords$ = this.#evaluatedPasswords.asObservable();

  #score = new BehaviorSubject<number>(0);
  public score$ = this.#score.asObservable();

  #hostElementRef = inject(ElementRef);

  async ngOnInit() {
    const evalutedPasswordsSafety = await this.#passwordEvaluatorService.evaluatePasswordsSafety(
      this.passwordEntries
    );
    this.#evaluatedPasswords.next(evalutedPasswordsSafety);

    const numberOfAttentionPasswords =
      this.#passwordEvaluatorService.getNumberOfAttentionPasswords(evalutedPasswordsSafety);
    this.numberOfAttentionPasswordsEvent.emit(numberOfAttentionPasswords);

    this.#passwordSaftyDashboard.next(
      this.#passwordEvaluatorService.getPasswordSaftyDashboardValues(evalutedPasswordsSafety)
    );

    this.#score.next(
      this.#passwordEvaluatorService.calculateTotalPassowrdSafetyScrore(evalutedPasswordsSafety)
    );
  }

  getStrengthClass(passwordStrength: TPasswordStrength): string {
    return `strength-${passwordStrength}`;
  }

  getScoreValueText(): string {
    const score = this.#score.getValue();
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  }

  onNavigate(path: 'edit' | 'details', passwordEntryId?: string) {
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
