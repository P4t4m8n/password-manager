import { Injectable } from '@angular/core';
import { AbstractDialogService } from '../../abstracts/dialog/dialog-service.abstract';
import { FetchingErrorDialog } from '../components/fetching-error-dialog/fetching-error-dialog';

@Injectable({
  providedIn: 'root',
})
export class FetchingErrorDialogService extends AbstractDialogService<void, FetchingErrorDialog> {
  protected componentType = FetchingErrorDialog;
}
