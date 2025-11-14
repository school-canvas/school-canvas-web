import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/state/auth.facade';

export const permissionGuard = (requiredPermissions: string[]) => {
  return () => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    return authFacade.user$.pipe(
      map((user) => {
        // For now, we'll check if user exists and has roles
        // In a full implementation, you'd check user.permissions array
        if (user && user.roles && user.roles.length > 0) {
          // TODO: Implement actual permission checking when backend supports it
          return true;
        } else {
          router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  };
};
