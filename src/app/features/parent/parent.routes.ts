import { Routes } from '@angular/router';
import { ParentLayoutComponent } from './components/parent-layout/parent-layout.component';
import { ParentDashboardComponent } from './components/parent-dashboard/parent-dashboard.component';
import { MyChildrenComponent } from './pages/my-children/my-children.component';
import { ChildProgressComponent } from './pages/child-progress/child-progress.component';
import { FeeManagementComponent } from './pages/fee-management/fee-management.component';
import { CommunicationComponent } from './pages/communication/communication.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { NotificationSettingsComponent } from './pages/notification-settings/notification-settings.component';

export const PARENT_ROUTES: Routes = [
  {
    path: '',
    component: ParentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ParentDashboardComponent },
      { path: 'children', component: MyChildrenComponent },
      { path: 'child-progress/:id', component: ChildProgressComponent },
      { path: 'fees', component: FeeManagementComponent },
      { path: 'communication', component: CommunicationComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'notification-settings', component: NotificationSettingsComponent },
    ]
  }
];
