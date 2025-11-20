import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PasswordEntryHttpService } from '../../services/password-entry-http-service';
import { Observable, Subscription } from 'rxjs';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';
import { IconSearch } from '../../../../core/icons/icon-search/icon-search';
import { IconPlus } from '../../../../core/icons/icon-plus/icon-plus';
import { IconSafety } from '../../../../core/icons/icon-safety/icon-safety';
import { RouterLink } from '@angular/router';
import { PASSWORD_ENTRIES_PATHS } from '../../consts/routes.const';
import { CommonModule } from '@angular/common';
import { PasswordEntryTable } from '../../components/password-entry-table/password-entry-table';

@Component({
  selector: 'app-password-entities',
  imports: [IconSearch, IconPlus, IconSafety, RouterLink, CommonModule, PasswordEntryTable],
  templateUrl: './password-entries.html',
  styleUrl: './password-entries.css',
})
export class PasswordEntries implements OnInit, OnDestroy {
  passwordEntryService = inject(PasswordEntryHttpService);

  passwordEntries$: Observable<IPasswordEntryDto[]> = this.passwordEntryService.passwordEntries$;
  private subscription: Subscription = new Subscription();
  public passwordEntriesPaths = PASSWORD_ENTRIES_PATHS;

  ngOnInit() {
    this.subscription.add(this.passwordEntryService.get().subscribe());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
