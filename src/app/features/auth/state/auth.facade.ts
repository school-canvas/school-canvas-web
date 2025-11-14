import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../state/app.state';
import { User, AuthRequest, UserRegistrationRequest } from '../../../core/models';
import * as AuthActions from './auth.actions';
import * as AuthSelectors from './auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private store = inject(Store<AppState>);

  // Selectors
  user$: Observable<User | null> = this.store.select(AuthSelectors.selectUser);
  token$: Observable<string | null> = this.store.select(AuthSelectors.selectToken);
  isAuthenticated$: Observable<boolean> = this.store.select(AuthSelectors.selectIsAuthenticated);
  loading$: Observable<boolean> = this.store.select(AuthSelectors.selectAuthLoading);
  error$: Observable<string | null> = this.store.select(AuthSelectors.selectAuthError);
  userRole$: Observable<string | undefined> = this.store.select(AuthSelectors.selectUserRole);
  userId$: Observable<string | undefined> = this.store.select(AuthSelectors.selectUserId);
  isPrincipal$: Observable<boolean> = this.store.select(AuthSelectors.selectIsPrincipal);
  isTeacher$: Observable<boolean> = this.store.select(AuthSelectors.selectIsTeacher);
  isStudent$: Observable<boolean> = this.store.select(AuthSelectors.selectIsStudent);
  isParent$: Observable<boolean> = this.store.select(AuthSelectors.selectIsParent);

  // Actions
  login(credentials: AuthRequest): void {
    this.store.dispatch(AuthActions.login({ credentials }));
  }

  register(request: UserRegistrationRequest): void {
    this.store.dispatch(AuthActions.register({ request }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  checkAuthStatus(): void {
    this.store.dispatch(AuthActions.checkAuthStatus());
  }

  clearError(): void {
    this.store.dispatch(AuthActions.clearAuthError());
  }
}
