import { Component, Input } from '@angular/core';
import { AbstractDialog } from '../../../../core/abstracts/dialog/dialog.abstract';
import { BehaviorSubject, map, takeWhile, tap, timer } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-show-master-password-dialog',
  imports: [AsyncPipe],
  templateUrl: './show-master-password-dialog.html',
  styleUrl: './show-master-password-dialog.css',
})
export class ShowMasterPasswordDialog extends AbstractDialog<void> {
  @Input({ required: true }) masterPassword!: string;

  private _timeLeftBeforeClosing = new BehaviorSubject<number>(30);
  timeLeftBeforeClosing$ = this._timeLeftBeforeClosing.asObservable();

  ngOnInit(): void {
    this.timeLeftBeforeClosing$ = timer(0, 1000).pipe(
      map((i) => 30 - i),
      takeWhile((val) => val >= 0),
      tap((val) => {
        if (val === 0) {
          this.submit();
        }
      })
    );
  }
  override submit(): void {
    this.resolve();
  }

  onDestroy(): void {
    this._timeLeftBeforeClosing.complete();
  }
}
