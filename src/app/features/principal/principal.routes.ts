import { Routes } from '@angular/router';
import { PrincipalLayoutComponent } from './components/principal-layout/principal-layout.component';
import { PrincipalDashboardComponent } from './components/principal-dashboard/principal-dashboard.component';

export const PRINCIPAL_ROUTES: Routes = [
  {
    path: '',
    component: PrincipalLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PrincipalDashboardComponent },
    ]
  }
];
