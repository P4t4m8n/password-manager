import { Injectable } from '@angular/core';
import { AbstractDialogService } from '../../../core/abstracts/dialog-service.abstract';
import { PasswordEntriesSafetyTableDialog } from '../components/password-entries-safety-table-dialog/password-entries-safety-table-dialog';

@Injectable({
  providedIn: 'root',
})
export class PasswordEntriesSafetyTableDialogService extends AbstractDialogService<
  void,
  PasswordEntriesSafetyTableDialog
> {
  protected componentType = PasswordEntriesSafetyTableDialog;
}
