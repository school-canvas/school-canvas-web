import { Routes } from '@angular/router';
import { PrincipalLayoutComponent } from './components/principal-layout/principal-layout.component';
import { PrincipalDashboardComponent } from './components/principal-dashboard/principal-dashboard.component';
import { StudentManagementComponent } from './pages/student-management/student-management.component';
import { TeacherManagementComponent } from './pages/teacher-management/teacher-management.component';
import { ClassManagementComponent } from './pages/class-management/class-management.component';
import { FinanceManagementComponent } from './pages/finance-management/finance-management.component';
import { ReportsAnalyticsComponent } from './pages/reports-analytics/reports-analytics.component';

export const PRINCIPAL_ROUTES: Routes = [
  {
    path: '',
    component: PrincipalLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PrincipalDashboardComponent },
      { path: 'students', component: StudentManagementComponent },
      { path: 'teachers', component: TeacherManagementComponent },
      { path: 'classes', component: ClassManagementComponent },
      { path: 'finance', component: FinanceManagementComponent },
      { path: 'reports', component: ReportsAnalyticsComponent },
    ]
  }
];
