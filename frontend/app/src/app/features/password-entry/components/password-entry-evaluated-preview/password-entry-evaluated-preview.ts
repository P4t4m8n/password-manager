import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

import { ExtendedTitleCasePipePipe } from '../../../../core/pipes/extended-title-case-pipe-pipe';
import { TimeAgoPipePipe } from '../../../../core/pipes/time-ago-pipe-pipe';
import { StrengthClassPipePipe } from '../../../../core/pipes/strength-class-pipe-pipe';

import { ExternalLink } from '../../../../core/components/external-link/external-link';
import { ShowPassword } from '../../../crypto/components/show-password/show-password';

import type {
  INavigateToPasswordEntryEvent,
  IPasswordEntryEvaluated,
} from '../../interfaces/passwordEntry';

@Component({
  selector: 'app-password-entry-evaluated-preview',
  imports: [
    ExternalLink,
    ExtendedTitleCasePipePipe,
    StrengthClassPipePipe,
    NgClass,
    TimeAgoPipePipe,
    ShowPassword,
  ],
  templateUrl: './password-entry-evaluated-preview.html',
  styleUrl: './password-entry-evaluated-preview.css',
})
export class PasswordEntryEvaluatedPreview {
  @Input({ required: true }) passwordEntryEvaluated!: IPasswordEntryEvaluated;
  @Output() navigateToPasswordEntryEvent = new EventEmitter<INavigateToPasswordEntryEvent>();

  onNavigate(path: 'edit' | 'details', passwordEntryId?: string) {
    this.navigateToPasswordEntryEvent.emit({ path, passwordEntryId });
  }
}
