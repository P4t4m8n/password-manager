import { Injectable } from '@angular/core';
import { MasterPasswordDialog } from '../components/master-password-dialog/master-password-dialog';
import { AbstractDialogService } from '../../../core/abstracts/dialog/dialog-service.abstract';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordDialogService extends AbstractDialogService<
  string | null,
  MasterPasswordDialog
> {
  protected componentType = MasterPasswordDialog;
}
