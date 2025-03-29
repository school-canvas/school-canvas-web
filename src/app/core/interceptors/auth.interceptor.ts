import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { HttpHandler, HttpRequest, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs'
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService : AuthService, private router:Router){}

    intercept(request : HttpRequest<unknown>, next:HttpHandler): Observable<HttpEvent<unknown>>{
        const token = this.authService.getToken();
        if(token) {
            const authReq = request.clone({
                setHeaders:{
                    Authorization: `Bearer ${token}`
                }
            });
        }
        return next.handle(request)
        .pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 401) {
                // Token expired or invalid
                this.authService.logout();
                this.router.navigate(['/auth/login']);
              }
              return throwError(() => error);
            })
          );;
    }
}