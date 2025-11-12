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
            console.log('Auth Effects - Login Response:', response);
            
            // Store token and tenant ID
            this.tokenService.saveToken(response.token);
            if (response.tenantId) {
              this.tokenService.saveTenantId(response.tenantId);
            }
            
            // Build user object from response or token
            let user = response.user;
            if (!user) {
              // If user object not in response, decode from token
              const decoded = this.tokenService.getDecodedToken();
              user = {
                id: decoded?.sub || '',
                username: response.username || credentials.username,
                email: decoded?.email || '',
                roles: response.roles?.map((r: string) => ({ name: r, description: '' })) || [],
                userRoles: response.roles?.map((r: string) => ({ role: r, userId: decoded?.sub || '' })) || [],
                tenantId: response.tenantId || decoded?.tenantId || '',
                firstName: '',
                lastName: '',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            }
            
            console.log('Constructed user object:', user);
            
            // Connect to WebSocket with userId
            if (user?.id) {
              this.websocketService.connect(user.id);
            }
            
            return AuthActions.loginSuccess({ 
              token: response.token, 
              user: user as any
            });
          }),
          catchError((error) => {
            console.error('Auth Effects - Login Error:', error);
            return of(AuthActions.loginFailure({ 
              error: error.error?.message || error.message || 'Login failed' 
            }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          console.log('Auth Effects - loginSuccess$ triggered with user:', user);
          this.notificationService.showSuccess('Login successful!');
          
          // Redirect based on role
          const role = getPrimaryRole(user);
          console.log('Detected role:', role);
          
          if (role === 'PRINCIPAL' || role === 'ADMIN') {
            console.log('Navigating to /principal/dashboard');
            this.router.navigate(['/principal/dashboard']);
          } else if (role === 'TEACHER') {
            console.log('Navigating to /teacher/dashboard');
            this.router.navigate(['/teacher/dashboard']);
          } else if (role === 'STUDENT') {
            console.log('Navigating to /student/dashboard');
            this.router.navigate(['/student/dashboard']);
          } else if (role === 'PARENT' || role === 'GUARDIAN') {
            console.log('Navigating to /parent/dashboard');
            this.router.navigate(['/parent/dashboard']);
          } else {
            console.log('Navigating to /dashboard (default)');
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
