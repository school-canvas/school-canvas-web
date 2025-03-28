import { Routes } from '@angular/router'
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component'
import { AuthGuard } from './core/gaurds/auth.guard'
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component'
import { HomeComponent } from './features/home/components/home/home.component'

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule,
          )
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  }
]

// {
//   path: 'auth',
//   loadChildren: () =>
//     import('./features/auth/auth.module').then((m) => m.AuthModule),
// },
// {
//   path: 'dashboard',
//   loadChildren: () => import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
// },
// { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
