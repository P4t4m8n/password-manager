import { Routes } from '@angular/router';
import { authGuard } from './features/Auth/guards/auth-guard';
import { AuthIndex } from './features/Auth/pages/auth-index/auth-index';
import { MainLayout } from './core/layout/main/main-root/main-layout';

export const routes: Routes = [
  { path: '', component: MainLayout, canActivate: [authGuard] },
  { path: 'auth', component: AuthIndex },
  { path: '**', redirectTo: '' },
];
