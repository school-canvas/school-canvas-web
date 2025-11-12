import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { NotificationService } from '../../../core/services/notification.service';
import { getPrimaryRole } from '../../../core/models/user.model';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private websocketService = inject(WebSocketService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) => {
            // Store token and tenant ID
            this.tokenService.saveToken(response.token);
            if (response.user.tenantId) {
              this.tokenService.saveTenantId(response.user.tenantId);
            }
            
            // Connect to WebSocket with userId
            if (response.user.id) {
              this.websocketService.connect(response.user.id);
            }
            
            return AuthActions.loginSuccess({ 
              token: response.token, 
              user: response.user 
            });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ 
              error: error.error?.message || 'Login failed' 
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          this.notificationService.showSuccess('Login successful!');
          
          // Redirect based on role
          const role = getPrimaryRole(user);
          if (role === 'PRINCIPAL' || role === 'ADMIN') {
            this.router.navigate(['/principal/dashboard']);
          } else if (role === 'TEACHER') {
            this.router.navigate(['/teacher/dashboard']);
          } else if (role === 'STUDENT') {
            this.router.navigate(['/student/dashboard']);
          } else if (role === 'PARENT' || role === 'GUARDIAN') {
            this.router.navigate(['/parent/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          this.notificationService.showError(error);
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ request }) =>
        this.authService.registerUser(request).pipe(
          map(() => {
            this.notificationService.showSuccess(
              'Registration successful! Please login.'
            );
            this.router.navigate(['/auth/login']);
            return AuthActions.registerSuccess({ 
              message: 'Registration successful' 
            });
          }),
          catchError((error) =>
            of(AuthActions.registerFailure({ 
              error: error.error?.message || 'Registration failed' 
            }))
          )
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        // Disconnect WebSocket
        this.websocketService.disconnect();
        
        // Clear all auth data
        this.tokenService.clearAll();
        
        // Navigate to login
        this.router.navigate(['/auth/login']);
        
        this.notificationService.showSuccess('Logged out successfully');
      }),
      map(() => AuthActions.logoutSuccess())
    )
  );

  checkAuthStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthStatus),
      map(() => {
        const token = this.tokenService.getToken();
        const isExpired = this.tokenService.isTokenExpired();
        
        if (token && !isExpired) {
          const user = this.tokenService.getUser();
          return AuthActions.setAuthUser({ user: user as any, token });
        } else {
          this.tokenService.clearAll();
          return AuthActions.logoutSuccess();
        }
      })
    )
  );
}
