import { Routes } from '@angular/router';
import { authGuard } from '../../auth/guards/auth-guard';
import { SettingsIndex } from '../pages/settings-index/settings-index';

export const SETTINGS_PATHS = {
  settingsIndex: 'settings',
} as const;

const SETTINGS_GUARDS = [authGuard];

export const SETTINGS_ROUTES: Routes = [
  {
    path: SETTINGS_PATHS.settingsIndex,
    component: SettingsIndex,
    canActivate: SETTINGS_GUARDS,
  },
];
