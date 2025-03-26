import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
    providedIn : 'root'
})
export class PrincipalGuard implements CanActivate{
    constructor(private authService:AuthService, private router: Router){}
     canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
         if(this.authService.isPrincipal()){
            return true;
         }
         this.router.navigate(['/dashboard'])
         return false;
     }
}