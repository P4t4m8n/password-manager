import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractDialog } from '../../../../abstracts/dialog.abstract';

@Component({
  selector: 'app-fetching-error-dialog',
  imports: [],
  templateUrl: './error-dialog.html',
  styleUrl: './error-dialog.css',
})
export class ErrorDialog extends AbstractDialog<void> {
  @Input() message: string = 'An unexpected error occurred, Please try again later.';
  @Input() backPath?: string = '/';
  @Input() backButtonText?: string = 'Close';

  #router = inject(Router);

  override submit(): void {
    if (this.backPath) {
      this.#router.navigate([this.backPath]);
    }
    this.resolve();

    return;
  }
}
