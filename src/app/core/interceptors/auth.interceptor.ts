import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { HttpHandler, HttpRequest, HttpEvent } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from 'rxjs'

@Injectable()
export class AuthInterceptor{
    constructor(private authService : AuthService){}

    intercept(request : HttpRequest<unknown>, next:HttpHandler): Observable<HttpEvent<unknown>>{
        const token = this.authService.getToken();
        if(token) {
            const authReq = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${token}`)
            })
            return next.handle(authReq);
        }
        return next.handle(request);
    }
}