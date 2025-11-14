import { ActionReducerMap } from '@ngrx/store';
import * as fromAuth from '../features/auth/state/auth.reducer';

export interface AppState {
  auth: fromAuth.AuthState;
  // TODO: Add other feature states here
  // student: fromStudent.StudentState;
  // teacher: fromTeacher.TeacherState;
  // class: fromClass.ClassState;
  // etc.
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  // TODO: Add other reducers here
};
