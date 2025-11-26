import { Routes } from '@angular/router';
import { authGuard } from '../../../Auth/guards/auth-guard';
import { MasterPasswordRecoveryPage } from '../pages/master-password-recovery-page/master-password-recovery-page';

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
