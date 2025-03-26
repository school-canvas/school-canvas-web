import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { PrincipalDashboardComponent } from './components/principal-dashboard/principal-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';

const routes: Routes = [
  { 
    path: '', 
    component: DashboardHomeComponent 
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