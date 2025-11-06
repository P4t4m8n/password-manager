import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { map, switchMap, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService._session_user$.pipe(
    take(1),
    switchMap((session) => {
      if (session) {
        return [true];
      }
      return authService.checkSession().pipe(
        map((res) => {
          
          return !!res || router.createUrlTree(['/auth']);
        })
      );
    })
  );
};
