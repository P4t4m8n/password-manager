import { Injectable } from '@angular/core';

import { AbstractDialogService } from '../../../core/abstracts/dialog-service.abstract';

import { PasswordEntriesSafetyDialog } from '../components/password-entries-safety-dialog/password-entries-safety-dialog';

@Injectable({
  providedIn: 'root',
})
export class PasswordEntriesSafetyDialogService extends AbstractDialogService<
  void,
  PasswordEntriesSafetyDialog
> {
  protected componentType = PasswordEntriesSafetyDialog;
}
