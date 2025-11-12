import { Routes } from '@angular/router'
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component'
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component'
import { HomeComponent } from './features/home/components/home/home.component'
import { authGuard } from './core/gaurds/auth.guard'
import { roleGuard } from './core/guards/role.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [authGuard],
  },
  {
    path: 'principal',
    loadChildren: () => 
      import('./features/principal/principal.routes').then(m => m.PRINCIPAL_ROUTES),
    canActivate: [authGuard, roleGuard(['PRINCIPAL', 'ADMIN'])],
  },
  {
    path: 'teacher',
    loadChildren: () => 
      import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES),
    canActivate: [authGuard, roleGuard(['TEACHER'])],
  },
  {
    path: 'student',
    loadChildren: () => 
      import('./features/student/student.routes').then(m => m.STUDENT_ROUTES),
    canActivate: [authGuard, roleGuard(['STUDENT'])],
  },
  {
    path: 'parent',
    loadChildren: () => 
      import('./features/parent/parent.routes').then(m => m.PARENT_ROUTES),
    canActivate: [authGuard, roleGuard(['PARENT', 'GUARDIAN'])],
  },
]
