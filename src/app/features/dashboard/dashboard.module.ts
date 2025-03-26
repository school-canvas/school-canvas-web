import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { PrincipalDashboardComponent } from './components/principal-dashboard/principal-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardHomeComponent,
    DashboardRoutingModule,
    SharedModule,
    PrincipalDashboardComponent,
    TeacherDashboardComponent,
    StudentDashboardComponent
  ]
})
export class DashboardModule { }
