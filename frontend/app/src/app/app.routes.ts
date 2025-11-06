import { Routes } from '@angular/router';
import { authGuard } from './features/Auth/guards/auth-guard';
import { AuthIndex } from './features/Auth/pages/auth-index/auth-index';
import { MainLayout } from './core/layout/main/main-root/main-layout';
import { PASSWORD_ENTRIES_ROUTES } from './core/consts/routes.const';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [...PASSWORD_ENTRIES_ROUTES],
  },
  { path: 'auth', component: AuthIndex },
  { path: '**', redirectTo: '' },
];
