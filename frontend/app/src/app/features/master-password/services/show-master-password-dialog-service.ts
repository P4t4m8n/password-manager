import { Injectable } from '@angular/core';
import { AbstractDialogService } from '../../../core/abstracts/dialog-service.abstract';
import { ShowMasterPasswordDialog } from '../components/show-master-password-dialog/show-master-password-dialog';

@Injectable({
  providedIn: 'root',
})
export class ShowMasterPasswordDialogService extends AbstractDialogService<
  void,
  ShowMasterPasswordDialog
> {
  protected componentType = ShowMasterPasswordDialog;
}
