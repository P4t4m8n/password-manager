import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  finalize,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

import { PASSWORD_ENTRIES_PATHS } from '../../consts/password-entry-routes.const';

import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { ErrorService } from '../../../../core/services/error-service';

import { Header } from '../../../../core/layout/header/header';
import { PasswordEntriesSafety } from '../../components/password-entries-safety/password-entries-safety';
import { PasswordEntryTable } from '../../components/password-entry-table/password-entry-table';
import { PasswordEntriesSkeleton } from '../../components/password-entries-skeleton/password-entries-skeleton';
import { IconPlus } from '../../../../core/icons/icon-plus/icon-plus';
import { IconSearch } from '../../../../core/icons/icon-search/icon-search';

import type { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { LoadingService } from '../../../../core/services/loading-service';
@Component({
  selector: 'app-password-entities',
  imports: [
    IconSearch,
    IconPlus,
    RouterLink,
    CommonModule,
    PasswordEntryTable,
    ReactiveFormsModule,
    Header,
    PasswordEntriesSafety,
    PasswordEntriesSkeleton,
  ],
  templateUrl: './password-entries.html',
  styleUrl: './password-entries.css',
})
export class PasswordEntries implements OnInit, OnDestroy {
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  #passwordEntryHttpService = inject(PasswordEntryHttpService);
  #errorService = inject(ErrorService);
  #loadingService = inject(LoadingService);

  //Exposing in run time the subscription for testing purposes
  public subscription: Subscription = new Subscription();

  public passwordEntries$: Observable<IPasswordEntryDto[] | null> =
    this.#passwordEntryHttpService.state$;

  public isFetching$ = this.#loadingService.isFetching$;

  public passwordEntriesPaths = PASSWORD_ENTRIES_PATHS;

  public searchControl = new FormControl('');

  ngOnInit() {
    this.subscription.add(
      this.#route.queryParams
        .pipe(
          switchMap((params) => {
            const entryName = params['entryName'] || '';
            const isLiked = params['isLiked'] || false;
            if (this.searchControl.value !== entryName) {
              this.searchControl.setValue(entryName, { emitEvent: false });
            }
            this.#loadingService.setFetching(true);

            return this.#passwordEntryHttpService
              .get({ entryName, isLiked })
              .pipe(finalize(() => this.#loadingService.setFetching(false)));
          })
        )
        .subscribe({
          error: (err) => {
            this.#errorService.handleError(err, { showToast: true });
          },
          complete: () => {
            // this.#isLoading.next(false);
          },
        })
    );

    this.subscription.add(
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
    this.subscription.unsubscribe();
  }
}
