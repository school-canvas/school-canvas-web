import { Routes } from '@angular/router';
import { TeacherLayoutComponent } from './components/teacher-layout/teacher-layout.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    component: TeacherLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TeacherDashboardComponent },
    ]
  }
];
