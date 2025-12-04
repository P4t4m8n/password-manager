import { Injectable } from '@angular/core';
import { AbstractDialogService } from '../../../abstracts/dialog-service.abstract';
import { ErrorDialog } from '../components/error-dialog/error-dialog';

@Injectable({
  providedIn: 'root',
})
export class ErrorDialogService extends AbstractDialogService<void, ErrorDialog> {
  protected componentType = ErrorDialog;
}
