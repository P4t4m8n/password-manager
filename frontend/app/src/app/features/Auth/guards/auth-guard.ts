import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, switchMap, take } from 'rxjs';

import { AuthHttpService } from '../services/auth-http-service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthHttpService);
  const router = inject(Router);

  return authService.data$.pipe(
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
