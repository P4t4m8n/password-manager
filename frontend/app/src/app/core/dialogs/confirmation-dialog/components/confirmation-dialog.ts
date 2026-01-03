import { Component, Input } from '@angular/core';
import { AbstractDialog } from '../../../abstracts/dialog.abstract';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [],
  templateUrl: './confirmation-dialog.html',
})
export class ConfirmationDialog extends AbstractDialog<boolean> {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';

  override submit(): void {
    this.resolve(true);
  }

  override cancel(): void {
    this.resolve(false);
  }
}
