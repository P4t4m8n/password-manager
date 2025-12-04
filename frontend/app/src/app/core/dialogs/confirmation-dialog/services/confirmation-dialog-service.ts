import { Injectable } from '@angular/core';


import { ConfirmationDialog } from '../components/confirmation-dialog';
import { AbstractDialogService } from '../../../abstracts/dialog-service.abstract';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService extends AbstractDialogService<boolean, ConfirmationDialog> {
  protected componentType = ConfirmationDialog;
}
