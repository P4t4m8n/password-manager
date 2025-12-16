import { Injectable } from '@angular/core';
import { AbstractDialogService } from '../../../core/abstracts/dialog-service.abstract';
import { RecoveryPasswordDialog } from '../components/recovery-password-dialog/recovery-password-dialog';

@Injectable({
  providedIn: 'root',
})
export class RecoveryPasswordDialogService extends AbstractDialogService<
  void,
  RecoveryPasswordDialog
> {
  protected componentType = RecoveryPasswordDialog;
}
