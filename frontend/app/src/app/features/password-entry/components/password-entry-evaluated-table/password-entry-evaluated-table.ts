import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PasswordEntryEvaluatedPreview } from '../password-entry-evaluated-preview/password-entry-evaluated-preview';

import type {
  INavigateToPasswordEntryEvent,
  IPasswordEntryEvaluated,
} from '../../interfaces/passwordEntry';

@Component({
  selector: 'app-password-entry-evaluated-table',
  imports: [PasswordEntryEvaluatedPreview],
  templateUrl: './password-entry-evaluated-table.html',
  styleUrl: './password-entry-evaluated-table.css',
})
export class PasswordEntriesEvaluatedTable {
  @Input({ required: true }) passwordEntriesEvaluated: IPasswordEntryEvaluated[] | null = [];
  @Output() navigateToPasswordEntryEvent = new EventEmitter<INavigateToPasswordEntryEvent>();

  onNavigate(event: INavigateToPasswordEntryEvent) {
    this.navigateToPasswordEntryEvent.emit(event);
  }
}
