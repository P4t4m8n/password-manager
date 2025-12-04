import { Injectable } from '@angular/core';

import { AbstractDialogService } from '../../abstracts/dialog/dialog-service.abstract';

import { ConfirmationDialog } from '../components/confirmation-dialog';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService extends AbstractDialogService<boolean, ConfirmationDialog> {
  protected componentType = ConfirmationDialog;
}
