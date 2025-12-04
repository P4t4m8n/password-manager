import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { debounceTime, distinctUntilChanged, Observable, Subscription, switchMap, tap } from 'rxjs';

import { PASSWORD_ENTRIES_PATHS } from '../../consts/routes.const';

import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { ErrorService } from '../../../../core/services/error-service';

import { IconSearch } from '../../../../core/icons/icon-search/icon-search';
import { IconPlus } from '../../../../core/icons/icon-plus/icon-plus';
import { IconSafety } from '../../../../core/icons/icon-safety/icon-safety';
import { PasswordEntryTable } from '../../components/password-entry-table/password-entry-table';
import { BackButton } from '../../../../core/components/back-button/back-button';

import type { IPasswordEntryDto } from '../../interfaces/passwordEntry';
@Component({
  selector: 'app-password-entities',
  imports: [
    IconSearch,
    IconPlus,
    IconSafety,
    RouterLink,
    CommonModule,
    PasswordEntryTable,
    BackButton,
    ReactiveFormsModule,
  ],
  templateUrl: './password-entries.html',
  styleUrl: './password-entries.css',
})
export class PasswordEntries implements OnInit, OnDestroy {
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  #passwordEntryHttpService = inject(PasswordEntryHttpService);
  #errorService = inject(ErrorService);

  #subscription: Subscription = new Subscription();

  public passwordEntries$: Observable<IPasswordEntryDto[]> =
    this.#passwordEntryHttpService.passwordEntries$;

  public passwordEntriesPaths = PASSWORD_ENTRIES_PATHS;

  public searchControl = new FormControl('');

  ngOnInit() {
    this.#subscription.add(
      this.#route.queryParams
        .pipe(
          switchMap((params) => {
            const entryName = params['entryName'] || '';
            if (this.searchControl.value !== entryName) {
              this.searchControl.setValue(entryName, { emitEvent: false });
            }

            return this.#passwordEntryHttpService.get({ entryName });
          })
        )
        .subscribe({
          error: (err) => {
            this.#errorService.handleError(err, { showToast: true });
          },
        })
    );

    this.#subscription.add(
      this.searchControl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          tap((searchTerm) => {
            this.#router.navigate([], {
              relativeTo: this.#route,
              queryParams: { entryName: searchTerm || null },
              queryParamsHandling: 'merge',
            });
          })
        )
        .subscribe({
          error: (err) => {
            this.#errorService.handleError(err, { showToast: true });
          },
        })
    );
  }

  ngOnDestroy() {
    this.#subscription.unsubscribe();
  }
}
