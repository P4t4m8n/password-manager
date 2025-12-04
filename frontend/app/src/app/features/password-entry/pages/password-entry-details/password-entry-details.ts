import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';

import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { CryptoService } from '../../../crypto/services/crypto.service';
import { ClipboardService } from '../../../../core/services/clipboard-service';
import { ErrorService } from '../../../../core/services/error-service';

import { BackButton } from '../../../../core/components/back-button/back-button';
import { PasswordStrength } from '../../../crypto/components/password-strength/password-strength';

import { IconPencil } from '../../../../core/icons/icon-pencil/icon-pencil';
import { IconOpenExternal } from '../../../../core/icons/icon-open-external/icon-open-external';
import { IconCopyPassword } from '../../../../core/icons/icon-copy-password/icon-copy-password';
import { IconEye } from '../../../../core/icons/icon-eye/icon-eye';
import { IconTrash } from '../../../../core/icons/icon-trash/icon-trash';
import { IconFavorite } from '../../../../core/icons/icon-favorite/icon-favorite';
import { IconTag } from '../../../../core/icons/icon-tag/icon-tag';

import type { IPasswordEntryDto } from '../../interfaces/passwordEntry';

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
    DatePipe,
  ],
  templateUrl: './password-entry-details.html',
  styleUrl: './password-entry-details.css',
})
export class PasswordEntryDetails {
  #clipboardService = inject(ClipboardService);
  #cryptoService = inject(CryptoService);
  #passwordEntryHttpService = inject(PasswordEntryHttpService);
  #errorService = inject(ErrorService);

  #route = inject(ActivatedRoute);
  #router = inject(Router);

  #passwordEntry = new BehaviorSubject<IPasswordEntryDto | null>(null);
  public passwordEntry$: Observable<IPasswordEntryDto | null> = this.#passwordEntry.asObservable();

  #showPassword = new BehaviorSubject<boolean>(false);
  public showPassword$ = this.#showPassword.asObservable();

  #revealedPassword = new BehaviorSubject<string | null>(null);
  public revealedPassword$ = this.#revealedPassword.asObservable();

  #showToast = new BehaviorSubject<boolean>(false);
  public showToast$ = this.#showToast.asObservable();

  ngOnInit() {
    this.passwordEntry$ = this.#route.params.pipe(
      map((params) => params['entryId']),
      switchMap((entryId) => this.#passwordEntryHttpService.getById(entryId)),
      switchMap(async (entry) => {
        this.#passwordEntry.next(entry);
        const decrypted = await this.#cryptoService.decryptPassword(
          entry.encryptedPassword,
          entry.iv
        );
        this.#revealedPassword.next(decrypted);
        return entry;
      }),
      catchError((error) => {
        this.#errorService.handleError(error, { showErrorDialog: true });

        return of(null);
      })
    );
  }

  async onShowPassword() {
    this.#showPassword.next(!this.#showPassword.value);
  }

  async copyPasswordToClipboard(): Promise<void> {
    let decryptedPassword: string | null = null;
    try {
      decryptedPassword = await this.#cryptoService.decryptPassword(
        this.#passwordEntry.value?.encryptedPassword,
        this.#passwordEntry.value?.iv
      );

      if (!decryptedPassword) {
        return;
      }
    } catch (err) {
      console.error('Failed to copy password:', err);
    }

    await this.onCopyToClipboard(decryptedPassword);

    setTimeout(() => this.#showToast.next(false), 2000);
  }

  async onCopyToClipboard(text?: string | null): Promise<void> {
    return await this.#clipboardService.copyToClipboard(text);
  }

  onDelete() {
    const entryId = this.#passwordEntry.value?.id;
    if (entryId) {
      this.#passwordEntryHttpService.delete(entryId).subscribe({
        next: () => {
          this.#router.navigate(['/entries']);
        },
        error: (err) => {
          console.error('Failed to delete password entry:', err);
        },
      });
    }
  }

  onDestroy() {
    this.#passwordEntry.complete();
    this.#showPassword.complete();
    this.#revealedPassword.complete();
    this.#showToast.complete();
  }
}
