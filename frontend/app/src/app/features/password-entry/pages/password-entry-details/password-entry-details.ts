import {  Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { AsyncPipe } from '@angular/common';
import { BackButton } from '../../../../core/components/back-button/back-button';
import { IconPencil } from '../../../../core/icons/icon-pencil/icon-pencil';
import { IconOpenExternal } from '../../../../core/icons/icon-open-external/icon-open-external';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { PasswordEntryService } from '../../services/password-entry-service';
import { PasswordStrength } from '../../../crypto/components/password-strength/password-strength';
import { ClipboardService } from '../../../../core/services/clipboard-service';
import { IconTrash } from '../../../../core/icons/icon-trash/icon-trash';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconTag } from '../../../../core/icons/icon-tag/icon-tag';

@Component({
  selector: 'app-password-entry-details',
  imports: [
    AsyncPipe,
    BackButton,
    RouterLink,
    IconPencil,
    IconOpenExternal,
    IconCopyPassword,
    IconEye,
    PasswordStrength,
    IconTrash,
    IconFavorite,
    IconTag,
  ],
  templateUrl: './password-entry-details.html',
  styleUrl: './password-entry-details.css',
})
export class PasswordEntryDetails {
  private clipboardService = inject(ClipboardService);

  private passwordEntryHttpService = inject(PasswordEntryHttpService);
  private passwordEntryService = inject(PasswordEntryService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private _passwordEntry = new BehaviorSubject<IPasswordEntryDto | null>(null);
  public passwordEntry$: Observable<IPasswordEntryDto | null> = this._passwordEntry.asObservable();

  private _showPassword = new BehaviorSubject<boolean>(false);
  showPassword$ = this._showPassword.asObservable();

  private _revealedPassword = new BehaviorSubject<string | null>(null);
  public revealedPassword$ = this._revealedPassword.asObservable();

  private _showToast = new BehaviorSubject<boolean>(false);
  public showToast$ = this._showToast.asObservable();

  ngOnInit() {
    this.passwordEntry$ = this.route.params.pipe(
      map((params) => params['entryId']),
      switchMap((entryId) => this.passwordEntryHttpService.getById(entryId)),
      tap(async (entry) => {
        this._passwordEntry.next(entry);
        const decrypted = await this.passwordEntryService.decryptPassword({
          encryptedPassword: this._passwordEntry.value?.encryptedPassword,
          iv: this._passwordEntry.value?.iv,
        });
        this._revealedPassword.next(decrypted);
      })
    );
  }

  async onShowPassword() {
    this._showPassword.next(!this._showPassword.value);
  }

  async copyPasswordToClipboard(): Promise<void> {
    const decryptedPassword = await this.passwordEntryService.decryptPassword({
      encryptedPassword: this._passwordEntry.value?.encryptedPassword,
      iv: this._passwordEntry.value?.iv,
    });

    if (!decryptedPassword) {
      return;
    }

    try {
      await this.clipboardService.copyToClipboard(decryptedPassword);
      this._showToast.next(true);
      setTimeout(() => this._showToast.next(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  }

  async copyToClipboard(text?: string): Promise<void> {
    return this.clipboardService.copyToClipboard(text);
  }

  onDelete() {
    const entryId = this._passwordEntry.value?.id;
    if (entryId) {
      this.passwordEntryHttpService.delete(entryId).subscribe({
        next: () => {
          this.router.navigate(['/entries']);
        },
        error: (err) => {
          console.error('Failed to delete password entry:', err);
        },
      });
    }
  }

  onDestroy() {
    this._passwordEntry.complete();
    this._showPassword.complete();
    this._revealedPassword.complete();
    this._showToast.complete();
  }
}
