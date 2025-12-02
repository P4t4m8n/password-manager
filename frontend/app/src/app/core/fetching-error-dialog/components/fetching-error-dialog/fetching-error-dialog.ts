import { Component, inject, Input } from '@angular/core';
import { AbstractDialog } from '../../../abstracts/dialog/dialog.abstract';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fetching-error-dialog',
  imports: [],
  templateUrl: './fetching-error-dialog.html',
  styleUrl: './fetching-error-dialog.css',
})
export class FetchingErrorDialog extends AbstractDialog<void> {
  @Input() message: string = 'An error occurred while fetching data. Please try again later.';
  @Input() backPath?: string = '/';
  @Input() backButtonText?: string = 'Close';

  private router = inject(Router);

  override submit(): void {
    if (this.backPath) {
      this.router.navigate([this.backPath]);
    }
    this.resolve();

    return;
  }
}
