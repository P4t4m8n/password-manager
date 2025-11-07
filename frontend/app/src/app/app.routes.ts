import { Routes } from '@angular/router';
import { authGuard } from './features/Auth/guards/auth-guard';
import { AuthIndex } from './features/Auth/pages/auth-index/auth-index';
import { MainLayout } from './core/layout/main/main-root/main-layout';
import { PASSWORD_ENTRIES_ROUTES } from './core/consts/routes.const';
import { PASSWORD_GENERATOR_ROUTES } from './features/password-generator/consts/password-generator.const';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [...PASSWORD_ENTRIES_ROUTES, ...PASSWORD_GENERATOR_ROUTES],
  },
  { path: 'auth', component: AuthIndex },
  { path: '**', redirectTo: '' },
];
