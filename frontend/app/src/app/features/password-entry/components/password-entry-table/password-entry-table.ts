import { Component, Input } from '@angular/core';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { PasswordEntryPreview } from '../password-entry-preview/password-entry-preview';

@Component({
  selector: 'app-password-entry-table',
  imports: [PasswordEntryPreview],
  templateUrl: './password-entry-table.html',
  styleUrl: './password-entry-table.css',
})
export class PasswordEntryTable {
  @Input() passwordEntries: IPasswordEntryDto[] = [];
}
