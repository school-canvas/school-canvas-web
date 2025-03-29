// src/app/core/guards/principal.guard.ts

import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ApplicationConfig } from '../../../application-config';

export const principalGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.userRole$.pipe(
    map(role => {
      if (role === ApplicationConfig.roles.PRINCIPAL) {
        return true;
      }
      
      // If logged in but not a principal, redirect to dashboard
      if (role) {
        router.navigate(['/dashboard/home']);
      } else {
        // If not logged in, redirect to login
        router.navigate(['/auth/login']);
      }
      
      return false;
    })
  );
};