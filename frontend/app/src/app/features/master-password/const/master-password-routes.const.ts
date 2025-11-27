import { Routes } from '@angular/router';
import { MasterPasswordRecoveryPage } from '../pages/master-password-recovery-page/master-password-recovery-page';
import { authGuard } from '../../auth/guards/auth-guard';

export const MASTER_PASSWORD_PATHS = {
  recovery: 'recovery',
} as const;

const MASTER_PASSWORD_GUARDS = [authGuard];

export const MASTER_PASSWORD_ROUTES: Routes = [
  {
    path: MASTER_PASSWORD_PATHS.recovery,
    component: MasterPasswordRecoveryPage,
    canActivate: MASTER_PASSWORD_GUARDS,
  },
] as const;
