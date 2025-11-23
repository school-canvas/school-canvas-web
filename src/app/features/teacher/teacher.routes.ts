import { Routes } from '@angular/router';
import { TeacherLayoutComponent } from './components/teacher-layout/teacher-layout.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { MyClassesComponent } from './pages/my-classes/my-classes.component';
import { ClassDetailComponent } from './pages/class-detail/class-detail.component';
import { TakeAttendanceComponent } from './pages/take-attendance/take-attendance.component';
import { GradebookComponent } from './pages/gradebook/gradebook.component';
import { ManageAssignmentsComponent } from './pages/manage-assignments/manage-assignments.component';
import { StudentProgressComponent } from './pages/student-progress/student-progress.component';
import { CommunicationComponent } from './pages/communication/communication.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationSettingsComponent } from './pages/notification-settings/notification-settings.component';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    component: TeacherLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TeacherDashboardComponent },
      { path: 'classes', component: MyClassesComponent },
      { path: 'classes/:id', component: ClassDetailComponent },
      { path: 'attendance/:id', component: TakeAttendanceComponent },
      { path: 'gradebook/:id', component: GradebookComponent },
      { path: 'assignments', component: ManageAssignmentsComponent },
      { path: 'student-progress', component: StudentProgressComponent },
      { path: 'communication', component: CommunicationComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'notification-settings', component: NotificationSettingsComponent },
    ]
  }
];
