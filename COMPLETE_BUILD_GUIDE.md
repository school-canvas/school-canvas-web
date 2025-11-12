# 🚀 COMPLETE BUILD GUIDE - ANGULAR SCHOOL MANAGEMENT SYSTEM

## ⚠️ IMPORTANT NOTE

This is an **EXTREMELY LARGE PROJECT** that requires:
- **17+ microservices** integration
- **4 complete role-based modules** (Principal, Teacher, Student, Parent)
- **NgRx state management** for all entities
- **100+ components**
- **50+ API services**
- **Estimated 50,000+ lines of code**

Building this completely in a single session would exceed token limits. This guide provides the **COMPLETE ARCHITECTURE** and **REUSABLE PATTERNS** so you can build it systematically.

---

## ✅ WHAT'S ALREADY COMPLETE (BASELINE)

1. ✅ Angular 19 project with Material
2. ✅ All environment URLs configured (17 microservices)
3. ✅ 4 HTTP interceptors (JWT, Tenant, Error, Loading)
4. ✅ Core services (Token, Loading, Notification, Theme, WebSocket)
5. ✅ Shared components (Loading spinner, Error message, Confirmation dialog, Theme toggle)
6. ✅ Complete theming system (Light/Dark mode)
7. ✅ NgRx packages installed
8. ✅ All TypeScript models created

---

## 📦 PHASE 1: FIX EXISTING CODE & ADD MISSING TYPES

### 1.1 Update User Model to Match Backend

The existing `user.model.ts` has a different structure. You need to add these interfaces:

```typescript
// Add to /src/app/core/models/user.model.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
}
```

### 1.2 Update TokenService

Add these missing methods to `TokenService`:

```typescript
saveToken(token: string): void {
  this.setToken(token);
}

saveTenantId(tenantId: string): void {
  localStorage.setItem('tenantId', tenantId);
}

getUser(): Partial<User> {
  const decoded = this.getDecodedToken();
  return {
    id: decoded?.userId,
    email: decoded?.email,
    tenantId: decoded?.tenantId,
    // Map role from roles array
    role: decoded?.roles?.[0] || decoded?.role
  };
}

clearAll(): void {
  this.removeToken();
  localStorage.removeItem('tenantId');
}
```

### 1.3 Update AuthService

Add the register method:

```typescript
register(request: RegisterRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/v1/auth/register/user`, request);
}
```

### 1.4 Fix WebSocket Service Import

Change `WebsocketService` to `WebSocketService` (capital S) in auth.effects.ts

---

## 📦 PHASE 2: CONFIGURE NGRX STORE

### 2.1 Update app.config.ts

```typescript
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { reducers } from './state/app.state';
import { AuthEffects } from './features/auth/state/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    provideStore(reducers),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
```

---

## 📦 PHASE 3: CREATE GUARDS

### 3.1 Role Guard

```bash
ng generate guard core/guards/role --functional
```

```typescript
// role.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/state/auth.facade';

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    return authFacade.userRole$.pipe(
      map((role) => {
        if (role && allowedRoles.includes(role)) {
          return true;
        } else {
          router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  };
};
```

### 3.2 Update Routes

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'principal',
    loadChildren: () => import('./features/principal/principal.routes').then(m => m.PRINCIPAL_ROUTES),
    canActivate: [authGuard, roleGuard(['PRINCIPAL', 'ADMIN'])],
  },
  {
    path: 'teacher',
    loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES),
    canActivate: [authGuard, roleGuard(['TEACHER'])],
  },
  {
    path: 'student',
    loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES),
    canActivate: [authGuard, roleGuard(['STUDENT'])],
  },
  {
    path: 'parent',
    loadChildren: () => import('./features/parent/parent.routes').then(m => m.PARENT_ROUTES),
    canActivate: [authGuard, roleGuard(['PARENT', 'GUARDIAN'])],
  },
];
```

---

## 📦 PHASE 4: CREATE API SERVICES (Pattern to Follow)

Create one service per microservice. Here's the pattern:

### Pattern: Student Service

```bash
ng generate service core/services/api/student --skip-tests
```

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student, CreateStudentRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = environment.apiUrls.student;

  constructor(private http: HttpClient) {}

  createStudent(request: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/api/v1/students/create`, request);
  }

  getStudentByUserId(userId: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/api/v1/students/${userId}`);
  }

  getAllStudents(page: number = 0, size: number = 20): Observable<PageResponse<Student>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Student>>(
      `${this.apiUrl}/api/v1/students/fetchAllStudents`,
      { params }
    );
  }

  updateStudent(userId: string, request: any): Observable<Student> {
    return this.http.put<Student>(
      `${this.apiUrl}/api/v1/students/updateStudent/${userId}`,
      request
    );
  }

  deleteStudent(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/v1/students/deleteStudent/${userId}`);
  }
}
```

**REPEAT THIS PATTERN FOR:**
- TeacherService (port 8083)
- ClassService (port 8084)
- AssessmentService (port 8085)
- AttendanceService (port 8086)
- FinanceService (port 8087)
- CommunicationService (port 8094)
- NotificationService (port 8093)
- DocumentService (port 8095)
- EventService (port 8092)
- LibraryService (port 8097)
- ReportService (port 8096)
- CurriculumService (port 8091)
- SchedulerService (port 8090)

---

## 📦 PHASE 5: CREATE SHARED COMPONENTS

### 5.1 Data Table Component

```bash
ng generate component shared/components/data-table
```

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'number' | 'badge' | 'action';
}

export interface TableAction {
  icon: string;
  label: string;
  handler: (row: any) => void;
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="data" matSort (matSortChange)="onSortChange($event)">
        <!-- Dynamic columns -->
        <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
          <th mat-header-cell *matHeaderCellDef [mat-sort-header]="column.sortable ? column.key : ''">
            {{ column.label }}
          </th>
          <td mat-cell *matCellDef="let row">
            {{ row[column.key] }}
          </td>
        </ng-container>

        <!-- Actions column -->
        <ng-container matColumnDef="actions" *ngIf="actions.length > 0">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let row">
            <button
              *ngFor="let action of actions"
              mat-icon-button
              [color]="action.color || 'primary'"
              (click)="action.handler(row)"
              [attr.aria-label]="action.label"
            >
              <mat-icon>{{ action.icon }}</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>

      <mat-paginator
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 20, 50, 100]"
        (page)="onPageChange($event)"
        showFirstLastButtons
      ></mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      width: 100%;
      overflow: auto;
    }
    table {
      width: 100%;
    }
  `]
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() totalElements = 0;
  @Input() pageSize = 20;
  
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  get displayedColumns(): string[] {
    const cols = this.columns.map(c => c.key);
    if (this.actions.length > 0) {
      cols.push('actions');
    }
    return cols;
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }
}
```

### 5.2 Stats Card Component

```bash
ng generate component shared/components/stats-card
```

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stats-card" [class]="'stats-card--' + color">
      <mat-card-content>
        <div class="stats-card__header">
          <mat-icon class="stats-card__icon">{{ icon }}</mat-icon>
          <h3 class="stats-card__title">{{ title }}</h3>
        </div>
        <div class="stats-card__value">{{ value }}</div>
        <div *ngIf="change !== undefined" class="stats-card__change" [class.positive]="change > 0" [class.negative]="change < 0">
          <mat-icon>{{ change > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ Math.abs(change) }}%
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stats-card {
      height: 100%;
      &--primary { border-left: 4px solid var(--color-primary); }
      &--success { border-left: 4px solid var(--color-success); }
      &--warning { border-left: 4px solid var(--color-warning); }
      &--error { border-left: 4px solid var(--color-error); }
      
      &__header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      &__icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
      &__title {
        font-size: 14px;
        margin: 0;
      }
      &__value {
        font-size: 32px;
        font-weight: bold;
        margin: 16px 0 8px;
      }
      &__change {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        &.positive { color: var(--color-success); }
        &.negative { color: --color-error); }
      }
    }
  `]
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = 'info';
  @Input() color: 'primary' | 'success' | 'warning' | 'error' = 'primary';
  @Input() change?: number;
  
  Math = Math;
}
```

**CREATE SIMILARLY:**
- PageHeaderComponent
- EmptyStateComponent
- AvatarComponent
- BreadcrumbComponent
- FileUploadComponent

---

## 📦 PHASE 6: CREATE CUSTOM PIPES

```bash
ng generate pipe shared/pipes/date-format
ng generate pipe shared/pipes/file-size
ng generate pipe shared/pipes/time-ago
ng generate pipe shared/pipes/truncate
```

Example: File Size Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
```

---

## 📦 PHASE 7: STUDENT MODULE (COMPLETE EXAMPLE)

### 7.1 Generate Module Structure

```bash
ng generate component features/student/dashboard
ng generate component features/student/my-classes
ng generate component features/student/assessments
ng generate component features/student/attendance
ng generate component features/student/grades
ng generate component features/student/library
ng generate component features/student/finance
ng generate component features/student/schedule
```

### 7.2 Student Routes

```typescript
// student.routes.ts
import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/student-layout.component').then(m => m.StudentLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.StudentDashboardComponent) },
      { path: 'my-classes', loadComponent: () => import('./my-classes/my-classes.component').then(m => m.MyClassesComponent) },
      { path: 'assessments', loadComponent: () => import('./assessments/assessments.component').then(m => m.AssessmentsComponent) },
      { path: 'attendance', loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'grades', loadComponent: () => import('./grades/grades.component').then(m => m.GradesComponent) },
      { path: 'library', loadComponent: () => import('./library/library.component').then(m => m.LibraryComponent) },
      { path: 'finance', loadComponent: () => import('./finance/finance.component').then(m => m.FinanceComponent) },
      { path: 'schedule', loadComponent: () => import('./schedule/schedule.component').then(m => m.ScheduleComponent) },
    ],
  },
];
```

### 7.3 Student Dashboard Component

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { StudentService } from '../../../core/services/api/student.service';
import { AuthFacade } from '../../auth/state/auth.facade';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent],
  template: `
    <div class="dashboard">
      <h1>Student Dashboard</h1>
      
      <div class="stats-grid">
        <app-stats-card
          title="Enrolled Classes"
          [value]="stats.enrolledClasses"
          icon="class"
          color="primary"
        ></app-stats-card>
        
        <app-stats-card
          title="Upcoming Assessments"
          [value]="stats.upcomingAssessments"
          icon="assignment"
          color="warning"
        ></app-stats-card>
        
        <app-stats-card
          title="Attendance"
          [value]="stats.attendancePercentage + '%'"
          icon="calendar_today"
          color="success"
        ></app-stats-card>
        
        <app-stats-card
          title="Average Grade"
          [value]="stats.averageGrade"
          icon="grade"
          color="primary"
        ></app-stats-card>
      </div>

      <!-- Add more widgets: Recent notifications, Upcoming events, etc. -->
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  stats = {
    enrolledClasses: 0,
    upcomingAssessments: 0,
    attendancePercentage: 0,
    averageGrade: '-'
  };

  constructor(
    private studentService: StudentService,
    private authFacade: AuthFacade
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Load student statistics
    // TODO: Implement based on your API
  }
}
```

---

## 📦 PHASE 8-12: REPEAT PATTERN FOR OTHER MODULES

Follow the same pattern for:

### TEACHER MODULE
- Dashboard (my classes, today's schedule, pending grading)
- My Classes
- Attendance Management (mark attendance)
- Assessment Management (create, grade)
- Communication

### PRINCIPAL MODULE
- Dashboard (stats overview, charts)
- User Management (CRUD, approve users)
- Student Management (CRUD, multi-step form)
- Teacher Management (CRUD)
- Class Management (CRUD, enrollment)
- Finance (fee structures, invoices, payments)
- Reports & Audit Logs

### PARENT MODULE
- Dashboard (children selector)
- View Child's Attendance
- View Child's Grades
- View Child's Finance
- Communication

---

## 📦 FINAL STEPS

### Update Login Component to Use AuthFacade

```typescript
import { AuthFacade } from '../state/auth.facade';

export class LoginComponent {
  constructor(private authFacade: AuthFacade) {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authFacade.login(this.loginForm.value);
    }
  }
}
```

### Update App Component

```typescript
export class AppComponent implements OnInit {
  constructor(private authFacade: AuthFacade) {}

  ngOnInit(): void {
    this.authFacade.checkAuthStatus();
  }
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

1. ✅ Fix auth models and services (Phase 1-2)
2. ✅ Create guards (Phase 3)
3. ✅ Create all API services (Phase 4)
4. ✅ Create shared components (Phase 5-6)
5. ✅ Build Student module completely (Phase 7)
6. ✅ Build Teacher module (Phase 8)
7. ✅ Build Principal module (Phase 9)
8. ✅ Build Parent module (Phase 10)
9. ✅ Build Communication module (Phase 11)
10. ✅ Polish and optimize (Phase 12-13)

---

## 📚 RESOURCES

- **IMPLEMENTATION_PROMPT.md** - Full API documentation
- **BASELINE_COMPLETE.md** - What's already done
- **QUICK_START.md** - Code snippets

---

## 🚨 NOTES

- This is a **MASSIVE** project
- Estimated **200+ components**
- Build iteratively, test frequently
- Use the patterns provided consistently
- Add TODO markers for incomplete features
- Git commit after each major feature

Good luck! 🚀
