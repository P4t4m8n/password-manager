import { Routes } from '@angular/router';
import { authGuard } from '../../auth/guards/auth-guard';
import { PasswordEntries } from '../pages/password-entries/password-entries';
import { PasswordEntryDetails } from '../pages/password-entry-details/password-entry-details';
import { PasswordEntryEdit } from '../pages/password-entry-edit/password-entry-edit';

export const PASSWORD_ENTRIES_PATHS = {
  passwordEntries: 'entries',
  passwordEntryDetails: 'entries/details',
  passwordEntryEdit: 'entries/edit',
  passwordEntriesFavorites: 'entries/favorites',
} as const;

const PASSWORD_ENTRY_GUARDS = [authGuard];

export const PASSWORD_ENTRIES_ROUTES: Routes = [
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntries,
    component: PasswordEntries,
    canActivate: PASSWORD_ENTRY_GUARDS,
    children: [],
  },
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntryDetails + '/:entryId',
    component: PasswordEntryDetails,
    canActivate: PASSWORD_ENTRY_GUARDS,
  },
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntryEdit + '/:entryId',
    component: PasswordEntryEdit,
    canActivate: PASSWORD_ENTRY_GUARDS,
  },
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntryEdit,
    component: PasswordEntryEdit,
    canActivate: PASSWORD_ENTRY_GUARDS,
  },
] as const;
