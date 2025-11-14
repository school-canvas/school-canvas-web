import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, getPrimaryRole } from '../../../core/models/user.model';
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
      tap(() => console.log('[PERF] Login action received:', new Date().toISOString())),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          tap(() => console.log('[PERF] Login response received:', new Date().toISOString())),
          map((response) => {
            console.log('Login Response:', response);

            // Store token and tenantId
            this.tokenService.saveToken(response.token);
            this.tokenService.saveTenantId(response.tenantId);
            console.log('[PERF] Token saved:', new Date().toISOString());

            // Construct user object
            let user: User;
            if (response.user) {
              user = response.user as User;
            } else {
              // Construct user from JWT token
              const decodedToken = this.tokenService.decodeToken();
              user = {
                id: decodedToken?.sub || '',
                username: credentials.username, // Use login username
                email: decodedToken?.email || '',
                firstName: '', // Will be loaded from profile API later
                lastName: '', // Will be loaded from profile API later
                roles: decodedToken?.roles?.map((roleName: string) => ({ 
                  id: roleName, 
                  name: roleName,
                  description: '',
                  predefined: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  permissions: []
                })) || [],
                active: true,
                status: 'APPROVED' as any, // UserStatus.APPROVED
                tenantId: decodedToken?.tenantId || response.tenantId
              };
            }

            console.log('Constructed User:', user);
            console.log('[PERF] User constructed, dispatching loginSuccess:', new Date().toISOString());

            // Don't connect to WebSocket here - it's done in separate effect
            return AuthActions.loginSuccess({
              token: response.token,
              user: user
            });
          }),
          catchError((error) => {
            console.error('Login Error:', error);
            return of(AuthActions.loginFailure({
              error: error.error?.message || 'Login failed'
            }));
          })
        )
      )
    )
  );  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          console.log('[PERF] loginSuccess$ effect triggered:', new Date().toISOString());
          console.log('Auth Effects - loginSuccess$ triggered with user:', user);
          this.notificationService.showSuccess('Login successful!');
          
          // Redirect based on role
          const role = getPrimaryRole(user);
          console.log('Detected role:', role);
          console.log('[PERF] About to navigate to dashboard:', new Date().toISOString());
          
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
          console.log('[PERF] Navigation called:', new Date().toISOString());
        })
      ),
    { dispatch: false }
  );

  // Connect to WebSocket after successful login (non-blocking)
  connectWebSocket$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          if (user?.id) {
            console.log('Connecting to WebSocket for user:', user.id);
            this.websocketService.connect(user.id);
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
