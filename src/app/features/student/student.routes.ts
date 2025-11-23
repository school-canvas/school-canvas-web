import { Routes } from '@angular/router';
import { StudentLayoutComponent } from './components/student-layout/student-layout.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { MyClassesComponent } from './pages/my-classes/my-classes.component';
import { ClassDetailComponent } from './pages/class-detail/class-detail.component';
import { MyAssessmentsComponent } from './pages/my-assessments/my-assessments.component';
import { MyGradesComponent } from './pages/my-grades/my-grades.component';
import { MyAttendanceComponent } from './pages/my-attendance/my-attendance.component';
import { LibraryBooksComponent } from './pages/library-books/library-books.component';
import { FeePaymentComponent } from './pages/fee-payment/fee-payment.component';
import { CommunicationComponent } from './pages/communication/communication.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationSettingsComponent } from './pages/notification-settings/notification-settings.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { EventListComponent } from './pages/event-list/event-list.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'classes', component: MyClassesComponent },
      { path: 'classes/:id', component: ClassDetailComponent },
      { path: 'assessments', component: MyAssessmentsComponent },
      { path: 'grades', component: MyGradesComponent },
      { path: 'attendance', component: MyAttendanceComponent },
      { path: 'library', component: LibraryBooksComponent },
      { path: 'fees', component: FeePaymentComponent },
      { path: 'communication', component: CommunicationComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'notification-settings', component: NotificationSettingsComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'event-list', component: EventListComponent },
    ]
  }
];
