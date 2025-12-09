import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main/main-root/main-layout';
import { PASSWORD_ENTRIES_ROUTES } from './features/password-entry/consts/password-entry-routes.const';
import { PASSWORD_GENERATOR_ROUTES } from './features/password-generator/consts/password-generator-routes.const';
import { SETTINGS_ROUTES } from './features/settings/const/settings-routes.const';
import { authGuard } from './features/auth/guards/auth-guard';
import { MASTER_PASSWORD_ROUTES } from './features/master-password/const/master-password-routes.const';
import { AuthIndex } from './features/auth/pages/auth-index/auth-index';
import { AUTH_ROUTES } from './features/auth/consts/auth-routes.const';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'entries', pathMatch: 'full' },
      ...PASSWORD_ENTRIES_ROUTES,
      ...PASSWORD_GENERATOR_ROUTES,
      ...SETTINGS_ROUTES,
      ...MASTER_PASSWORD_ROUTES,
    ],
  },
  ...AUTH_ROUTES,
  { path: '**', redirectTo: '' },
];
