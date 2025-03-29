import { Routes } from '@angular/router'
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component'
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component'
import { HomeComponent } from './features/home/components/home/home.component'
import { importProvidersFrom } from '@angular/core'
import { CoreModule } from './core/core.module'

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    // providers: [importProvidersFrom(CoreModule)],
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
