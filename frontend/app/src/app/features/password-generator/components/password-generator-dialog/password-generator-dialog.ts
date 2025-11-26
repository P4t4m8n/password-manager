import { Component, EventEmitter, Output } from '@angular/core';
import { PasswordGenerator } from '../password-generator/password-generator';
import { DialogDirective } from '../../../../core/directives/dialog.directive';
import { IconPasswordGenerator } from '../../../../core/icons/icon-password-generator/icon-password-generator';

@Component({
  selector: 'app-password-generator-dialog',
  imports: [IconPasswordGenerator, PasswordGenerator],
  templateUrl: './password-generator-dialog.html',
  styleUrl: './password-generator-dialog.css',
})
export class PasswordGeneratorDialog extends DialogDirective {
  @Output() passwordSelected = new EventEmitter<string>();

  onPasswordSelected(password: string) {
    this.passwordSelected.emit(password);
    this.close();
  }
}
