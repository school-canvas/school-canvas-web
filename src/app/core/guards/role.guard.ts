import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/state/auth.facade';

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    return authFacade.userRole$.pipe(
      map((role) => {
        if (role && allowedRoles.includes(role)) {
          return true;
        } else {
          router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  };
};
