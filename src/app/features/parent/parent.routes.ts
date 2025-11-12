import { Routes } from '@angular/router';
import { ParentLayoutComponent } from './components/parent-layout/parent-layout.component';
import { ParentDashboardComponent } from './components/parent-dashboard/parent-dashboard.component';
import { MyChildrenComponent } from './pages/my-children/my-children.component';

export const PARENT_ROUTES: Routes = [
  {
    path: '',
    component: ParentLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ParentDashboardComponent },
      { path: 'children', component: MyChildrenComponent },
    ]
  }
];
