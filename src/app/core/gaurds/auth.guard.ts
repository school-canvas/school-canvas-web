import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { AuthService } from '../services/auth.service'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): MaybeAsync<GuardResult> {
    if (this.authService.isLoggedIn()) {
      //check for specific role requirement
      const requiredRole = route.data['role'] as string

      if (requiredRole && !this.authService.hasRole(requiredRole)) {
        this.router.navigate(['/dashboard'])
        return false
      }
      return true
    }
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    })
    return false
  }
}
