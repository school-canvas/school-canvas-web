import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      }
      
      // Store the attempted URL for redirecting
      const redirectUrl = state.url;
      
      // Navigate to the login page with extras
      router.navigate(['/auth/login'], { 
        queryParams: { redirectUrl } 
      });
      
      return false;
    })
  );
};