import { Component, Input, ViewChild } from '@angular/core';
import { AbstractDialog } from '../../../../core/abstracts/dialog.abstract';
import { IEvaluatedPasswordSafety } from '../../interfaces/passwordEntry';
import { IconPlus } from '../../../../core/icons/icon-plus/icon-plus';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ShowPassword } from "../../../crypto/components/show-password/show-password";
import { TimeAgoPipePipe } from '../../../../core/pipes/time-ago-pipe-pipe';

@Component({
  selector: 'app-password-entries-safety-table-dialog',
  imports: [AsyncPipe, ShowPassword,TimeAgoPipePipe],
  templateUrl: './password-entries-safety-table-dialog.html',
  styleUrl: './password-entries-safety-table-dialog.css',
})
export class PasswordEntriesSafetyTableDialog extends AbstractDialog<void> {
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
  @Input() evalutedPasswordsSafety: IEvaluatedPasswordSafety[] = [];

  NgOnInit() {
    this.#passwordSaftyDashboard.next([
      {
        label: 'Total',
        value: this.evalutedPasswordsSafety.length,
      },
      {
        label: 'Weak',
        value: this.evalutedPasswordsSafety.filter((p) => p.strength === 'weak').length,
      },
      {
        label: 'Duplicate',
        value: this.evalutedPasswordsSafety.filter((p) => p.duplicated > 0).length,
      },
      {
        label: 'Old',
        value: (() => {
          const now = new Date();
          return this.evalutedPasswordsSafety.filter((p) => {
            const lastChangeDate =
              typeof p.lastChange === 'string' ? new Date(p.lastChange) : p.lastChange;
            const diffInMs = now.getTime() - lastChangeDate.getTime();
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
            return diffInDays > 180; // older than 180 days
          }).length;
        })(),
      },
    ]);

    this.passwordSaftyDashboard$.subscribe((dashboard) => {
      console.log('Dashboard updated:', dashboard);
    });
  }
  override submit(): void {}
}
