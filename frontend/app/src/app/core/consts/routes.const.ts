import { Routes } from '@angular/router';
import { authGuard } from '../../features/Auth/guards/auth-guard';
import { PasswordEntries } from '../../features/password-entry/pages/password-entries/password-entries';
import { PasswordEntryDetails } from '../../features/password-entry/pages/password-entry-details/password-entry-details';
import { PasswordEntryEdit } from '../../features/password-entry/pages/password-entry-edit/password-entry-edit';
import { PasswordGenerator } from '../../features/password-entry/pages/password-generator/password-generator';

export const PASSWORD_ENTRIES_PATHS = {
  passwordEntities: 'logins',
  passwordEntityDetails: 'logins/details',
  passwordEntityEdit: 'logins/edit',
  passwordGenerator: 'generate',
} as const;

const PASSWORD_ENTRY_GUARDS = [authGuard];

export const PASSWORD_ENTRIES_ROUTES: Routes = [
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntities,
    component: PasswordEntries,
    canActivate: PASSWORD_ENTRY_GUARDS,
    children: [],
  },
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntityDetails,
    component: PasswordEntryDetails,
    canActivate: PASSWORD_ENTRY_GUARDS,
  },
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntityEdit + '/:id',
    component: PasswordEntryEdit,
    canActivate: PASSWORD_ENTRY_GUARDS,
  },
  {
    path: PASSWORD_ENTRIES_PATHS.passwordEntityEdit,
    component: PasswordEntryEdit,
    canActivate: PASSWORD_ENTRY_GUARDS,
  },
  {
    path: PASSWORD_ENTRIES_PATHS.passwordGenerator,
    component: PasswordGenerator,
    canActivate: PASSWORD_ENTRY_GUARDS,
  },
] as const;
