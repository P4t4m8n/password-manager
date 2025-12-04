import { Injectable } from '@angular/core';
import { AbstractDialogService } from '../../../core/abstracts/dialog-service.abstract';
import { PasswordGeneratorDialog } from '../components/password-generator-dialog/password-generator-dialog';

@Injectable({
  providedIn: 'root',
})
export class PasswordGeneratorDialogService extends AbstractDialogService<
  string | null,
  PasswordGeneratorDialog
> {
  protected componentType = PasswordGeneratorDialog;
}
