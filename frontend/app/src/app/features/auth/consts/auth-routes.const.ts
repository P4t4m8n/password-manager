import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth-guard';
import { AuthIndex } from '../pages/auth-index/auth-index';

export const AUTH_PATHS = {
  auth: 'auth',
  afterSignup: 'after-signup',
} as const;

const AUTH_GUARRDS = [authGuard];

export const AUTH_ROUTES: Routes = [
  {
    path: AUTH_PATHS.auth,
    component: AuthIndex,
  },
  // {
  //   path: AUTH_PATHS.afterSignup,
  //   component: AfterSignupIndex,
  //   canActivate: AUTH_GUARRDS,
  // },
] as const;
