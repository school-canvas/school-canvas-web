import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest, AuthRequest, UserRegistrationRequest } from '../../../core/models';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: AuthRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ token: string; user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ request: UserRegistrationRequest }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ message: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout Action
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Check Auth Status
export const checkAuthStatus = createAction('[Auth] Check Auth Status');

export const setAuthUser = createAction(
  '[Auth] Set Auth User',
  props<{ user: User; token: string }>()
);

// Clear Error
export const clearAuthError = createAction('[Auth] Clear Error');
