import { Routes } from '@angular/router';
import { StudentLayoutComponent } from './components/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
    ]
  }
];
