import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { PrincipalDashboardComponent } from './components/principal-dashboard/principal-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { authGuard } from '../../core/gaurds/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: DashboardHomeComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'principal', 
    component: PrincipalDashboardComponent 
  },
  { 
    path: 'teacher', 
    component: TeacherDashboardComponent 
  },
  { 
    path: 'student', 
    component: StudentDashboardComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }