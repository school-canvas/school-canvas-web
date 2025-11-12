import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { getPrimaryRole } from '../../../core/models/user.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user ? getPrimaryRole(user) : undefined
);

export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id
);

export const selectTenantId = createSelector(
  selectUser,
  (user) => user?.tenantId
);

export const selectIsRole = (role: string) =>
  createSelector(selectUserRole, (userRole) => userRole === role);

export const selectIsPrincipal = createSelector(
  selectUserRole,
  (role) => role === 'PRINCIPAL' || role === 'ADMIN'
);

export const selectIsTeacher = createSelector(
  selectUserRole,
  (role) => role === 'TEACHER'
);

export const selectIsStudent = createSelector(
  selectUserRole,
  (role) => role === 'STUDENT'
);

export const selectIsParent = createSelector(
  selectUserRole,
  (role) => role === 'PARENT' || role === 'GUARDIAN'
);
