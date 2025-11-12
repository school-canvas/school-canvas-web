import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, timeout, filter } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/state/auth.facade';

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    console.log('[PERF] roleGuard checking...', new Date().toISOString());
    
    return authFacade.userRole$.pipe(
      filter((role): role is string => role !== undefined && role !== null), // Wait for role to be available
      timeout(5000), // Timeout after 5 seconds
      take(1), // Take first emission and complete
      map((role) => {
        console.log('[PERF] roleGuard received role:', role, new Date().toISOString());
        if (allowedRoles.includes(role)) {
          console.log('[PERF] roleGuard: Access granted');
          return true;
        } else {
          console.log('[PERF] roleGuard: Access denied, redirecting to login');
          router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  };
};
