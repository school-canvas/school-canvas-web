# 🚀 QUICK START GUIDE - Angular School Management System

## 📋 API Quick Reference Card

### All Microservices (17 Total)
```typescript
// Copy-paste ready API URLs from environment.ts
const API = {
  users: 'http://localhost:8080',         // Auth, Users, Roles
  tenant: 'http://localhost:8081',        // Tenant Management
  student: 'http://localhost:8082',       // Students
  teacher: 'http://localhost:8083',       // Teachers
  class: 'http://localhost:8084',         // Classes & Enrollment
  assessment: 'http://localhost:8085',    // Assessments, Quizzes
  attendance: 'http://localhost:8086',    // Attendance Tracking
  finance: 'http://localhost:8087',       // Fees, Payments, Invoices
  auditLogs: 'http://localhost:8088',     // Audit Logs (Read-only)
  guardian: 'http://localhost:8089',      // Parents/Guardians
  scheduler: 'http://localhost:8090',     // Class Schedules
  curriculum: 'http://localhost:8091',    // Subjects, Topics
  event: 'http://localhost:8092',         // Events, Calendar
  notification: 'http://localhost:8093',  // Notifications
  communication: 'http://localhost:8094', // Messages, Chat (WebSocket)
  document: 'http://localhost:8095',      // File Upload/Download
  report: 'http://localhost:8096',        // PDF Reports
  library: 'http://localhost:8097'        // Library Management
};
```

---

## 🔐 Most Used Endpoints (Copy-Paste Ready)

### Authentication (Port 8080)
```typescript
// Login
POST http://localhost:8080/api/v1/auth/login
Body: { "email": "admin@school.com", "password": "password" }
Response: { "token": "jwt...", "user": {...} }

// Register Principal (Requires X-Tenant-ID header)
POST http://localhost:8080/api/v1/auth/register/principal
Headers: { "X-Tenant-ID": "nawal2036" }
Body: { "firstName": "John", "lastName": "Doe", "email": "...", "password": "..." }

// Register User (Teacher/Student/Parent)
POST http://localhost:8080/api/v1/auth/register/user
Body: { "firstName": "...", "lastName": "...", "email": "...", "password": "...", "role": "TEACHER" }
```

### Students (Port 8082)
```typescript
// Get all students
GET http://localhost:8082/api/v1/students/fetchAllStudents
Headers: { "Authorization": "Bearer <token>", "X-Tenant-ID": "nawal2036" }

// Get student by user ID
GET http://localhost:8082/api/v1/students/{userId}

// Create student (PRINCIPAL only)
POST http://localhost:8082/api/v1/students/create
Body: { "userId": "...", "gradeLevel": "10", "section": "A", ... }

// Update student
PUT http://localhost:8082/api/v1/students/updateStudent/{userId}
```

### Teachers (Port 8083)
```typescript
// Get all teachers
GET http://localhost:8083/api/v1/teachers/allTeachers

// Create teacher
POST http://localhost:8083/api/v1/teachers/create
Body: { "userId": "...", "employeeId": "EMP001", "department": "...", ... }
```

### Classes (Port 8084)
```typescript
// Get all classes
GET http://localhost:8084/api/v1/classes/getAllClasses

// Create class
POST http://localhost:8084/api/v1/classes/createClass
Body: { "className": "Math A", "gradeLevel": "10", "teacherId": "...", ... }

// Enroll student
POST http://localhost:8084/api/v1/enrollments/enrollStudent
Body: { "classId": "...", "studentId": "...", "enrollmentDate": "2024-01-01" }
```

### Attendance (Port 8086)
```typescript
// Mark attendance
POST http://localhost:8086/api/v1/attendance/students/mark
Body: { "studentId": "...", "classId": "...", "date": "2024-01-01", "status": "PRESENT" }

// Get student attendance
GET http://localhost:8086/api/v1/attendance/students/student/{studentId}?startDate=2024-01-01&endDate=2024-01-31
```

### Finance (Port 8087)
```typescript
// Get all payments
GET http://localhost:8087/api/v1/finance/payments

// Record payment
POST http://localhost:8087/api/v1/finance/payments
Body: { "invoiceId": "...", "amount": 5000, "paymentMethod": "CASH", ... }
```

### Communication (Port 8094) - WebSocket
```typescript
// Send message
POST http://localhost:8094/api/v1/communication/messages
Body: { "threadId": "...", "content": "Hello", "attachments": [...] }

// Get thread messages
GET http://localhost:8094/api/v1/communication/messages/thread/{threadId}?page=0&size=20

// WebSocket connection
ws://localhost:8094/ws
Topics:
  - /topic/messages
  - /topic/notifications
  - /user/queue/messages
```

### Notifications (Port 8093)
```typescript
// Get my notifications
GET http://localhost:8093/api/v1/notifications/my-notifications?page=0&size=10

// Get unread count
GET http://localhost:8093/api/v1/notifications/unread-count

// Mark as read
PUT http://localhost:8093/api/v1/notifications/{notificationId}/read
```

### Documents (Port 8095)
```typescript
// Upload document (multipart/form-data)
POST http://localhost:8095/api/v1/documents
Body: FormData with file

// Download document
GET http://localhost:8095/api/v1/documents/{id}/download

// Search documents
GET http://localhost:8095/api/v1/documents/search?keyword=assignment
```

---

## 🛠️ Common Code Snippets

### 1. Create an API Service
```typescript
// src/app/core/services/student-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrls.student;

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/api/v1/students/fetchAllStudents`);
  }

  getById(userId: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/api/v1/students/${userId}`);
  }

  create(student: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/api/v1/students/create`, student);
  }

  update(userId: string, student: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/api/v1/students/updateStudent/${userId}`, student);
  }

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/students/deleteStudent/${userId}`);
  }
}
```

### 2. Create a List Component
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { StudentApiService } from '../../core/services/student-api.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  template: `
    <div class="student-list">
      <h2>Students</h2>
      <table mat-table [dataSource]="students">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let student">{{student.name}}</td>
        </ng-container>
        
        <ng-container matColumnDef="grade">
          <th mat-header-cell *matHeaderCellDef>Grade</th>
          <td mat-cell *matCellDef="let student">{{student.gradeLevel}}</td>
        </ng-container>
        
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentApiService);
  
  students: any[] = [];
  displayedColumns = ['name', 'grade'];

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.studentService.getAll().subscribe({
      next: (data) => this.students = data,
      error: (err) => console.error('Error loading students', err)
    });
  }
}
```

### 3. Create a Form Component
```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StudentApiService } from '../../core/services/student-api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>First Name</mat-label>
        <input matInput formControlName="firstName" required>
        <mat-error *ngIf="studentForm.get('firstName')?.hasError('required')">
          First name is required
        </mat-error>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Last Name</mat-label>
        <input matInput formControlName="lastName" required>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Grade Level</mat-label>
        <input matInput formControlName="gradeLevel" required>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="studentForm.invalid">
        Create Student
      </button>
    </form>
  `
})
export class StudentFormComponent {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentApiService);
  private notificationService = inject(NotificationService);

  studentForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    gradeLevel: ['', Validators.required]
  });

  onSubmit() {
    if (this.studentForm.valid) {
      this.studentService.create(this.studentForm.value).subscribe({
        next: () => {
          this.notificationService.showSuccess('Student created successfully');
          this.studentForm.reset();
        },
        error: (err) => {
          // Error handled by interceptor, but you can add custom logic here
          console.error('Error creating student', err);
        }
      });
    }
  }
}
```

### 4. Use WebSocket
```typescript
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../../core/services/websocket.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-container">
      <div *ngFor="let message of messages">
        {{ message.content }}
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  private webSocketService = inject(WebSocketService);
  private tokenService = inject(TokenService);
  
  messages: any[] = [];

  ngOnInit() {
    const userId = this.tokenService.getUserId()!;
    
    // Connect if not already connected
    if (!this.webSocketService.isConnected$) {
      this.webSocketService.connect(userId);
    }

    // Subscribe to messages
    this.webSocketService.subscribe('/topic/messages', (message) => {
      this.messages.push(message);
    });
  }

  ngOnDestroy() {
    this.webSocketService.unsubscribe('/topic/messages');
  }

  sendMessage(content: string) {
    this.webSocketService.send('/app/chat', { content });
  }
}
```

### 5. Use Theme Toggle
```html
<!-- In header component -->
<header class="app-header">
  <h1>School Management System</h1>
  <div class="header-actions">
    <app-theme-toggle></app-theme-toggle>
    <button mat-icon-button>
      <mat-icon>notifications</mat-icon>
    </button>
  </div>
</header>
```

### 6. Show Confirmation Dialog
```typescript
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({...})
export class MyComponent {
  private dialog = inject(MatDialog);

  confirmDelete(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this record?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User confirmed, proceed with deletion
        this.performDelete(id);
      }
    });
  }
}
```

---

## 🎨 Styling Quick Reference

### Use CSS Variables
```css
/* Apply primary color */
.my-button {
  background-color: var(--primary-color);
  color: var(--primary-contrast);
}

/* Use spacing */
.my-container {
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

/* Use shadows */
.my-card {
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-lg);
}
```

### Use Utility Classes
```html
<!-- Flexbox -->
<div class="d-flex justify-between align-center gap-md">
  <span>Left content</span>
  <span>Right content</span>
</div>

<!-- Spacing -->
<div class="mt-lg mb-md p-lg">
  Content with spacing
</div>

<!-- Text styling -->
<h1 class="text-primary font-bold">Heading</h1>
<p class="text-secondary">Subtitle</p>

<!-- Card -->
<div class="bg-surface shadow-md rounded-lg p-lg">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

---

## 🔑 Authentication Flow

### Login
```typescript
// 1. User submits login form
login(credentials: { email: string; password: string }) {
  this.http.post(`${API.users}/api/v1/auth/login`, credentials)
    .subscribe({
      next: (response: any) => {
        // 2. Store JWT token (done by you or service)
        localStorage.setItem('auth_token', response.token);
        
        // 3. Store tenant ID
        localStorage.setItem('tenant_id', response.tenantId);
        
        // 4. Connect WebSocket
        this.webSocketService.connect(response.userId);
        
        // 5. Navigate to dashboard
        this.router.navigate(['/dashboard']);
      }
    });
}
```

### Logout
```typescript
logout() {
  // 1. Clear localStorage
  localStorage.clear();
  
  // 2. Disconnect WebSocket
  this.webSocketService.disconnect();
  
  // 3. Navigate to login
  this.router.navigate(['/auth/login']);
}
```

### Check if logged in
```typescript
isLoggedIn(): boolean {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  
  // Check if token is expired
  return !this.tokenService.isTokenExpired();
}
```

---

## 📦 Package Installation Commands

```bash
# If you need to install NgRx
ng add @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools

# If you need chart library
npm install chart.js ng2-charts

# If you need rich text editor
npm install ngx-quill quill

# If you need date manipulation
npm install date-fns

# If you need PDF generation (client-side)
npm install jspdf jspdf-autotable

# If you need Excel export
npm install xlsx
```

---

## 🐛 Debugging Tips

### Check if JWT token is being sent
```
1. Open browser DevTools
2. Go to Network tab
3. Make any API call
4. Click on the request
5. Check "Request Headers" section
6. Look for: Authorization: Bearer <token>
```

### Check if Tenant ID is being sent
```
Same as above, but look for:
X-Tenant-ID: nawal2036
```

### Check WebSocket connection
```
1. Open browser console
2. Look for: "STOMP: Connected"
3. If errors, check:
   - Is communication service running on port 8094?
   - Is JWT token valid?
   - Is tenant ID set?
```

### Check theme variables
```
1. Open browser DevTools
2. Go to Elements tab
3. Click on <html> element
4. Check "Styles" panel
5. Look for :root { --primary-color: ... }
```

---

## 🎯 Key Files Reference

```
📁 Project Structure
├── /src/environments/
│   ├── environment.ts            ← All API URLs here
│   └── environment.prod.ts       ← Production API URLs
│
├── /src/app/
│   ├── app.config.ts             ← Interceptors configured here
│   ├── app.routes.ts             ← Main routing
│   │
│   ├── /core/
│   │   ├── /guards/
│   │   │   └── auth.guard.ts
│   │   ├── /interceptors/
│   │   │   ├── jwt.interceptor.ts
│   │   │   ├── tenant.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   └── /services/
│   │       ├── token.service.ts  ← JWT operations
│   │       ├── loading.service.ts
│   │       ├── notification.service.ts
│   │       ├── theme.service.ts
│   │       └── websocket.service.ts
│   │
│   ├── /shared/
│   │   └── /components/
│   │       ├── loading-spinner/
│   │       ├── error-message/
│   │       ├── confirmation-dialog/
│   │       └── theme-toggle/
│   │
│   └── /features/
│       ├── /auth/
│       ├── /dashboard/
│       ├── /principal/    ← Create this
│       ├── /teacher/      ← Create this
│       ├── /student/      ← Create this
│       └── /parent/       ← Create this
│
├── /src/assets/
│   └── /images/
│       ├── school-logo.png
│       └── school-image.png
│
├── /src/
│   ├── styles.css         ← Theme variables
│   └── styles-utilities.css ← Utility classes
│
└── /
    ├── IMPLEMENTATION_PROMPT.md  ← Full implementation guide
    ├── BASELINE_COMPLETE.md      ← What's been done
    └── QUICK_START.md            ← THIS FILE
```

---

## ✅ Pre-flight Checklist

Before starting development:

- [ ] All backend services running (ports 8080-8097)
- [ ] Kafka running (localhost:9092)
- [ ] PostgreSQL running (school-canvas-nawal database)
- [ ] `npm install` completed
- [ ] `ng serve` runs without errors
- [ ] Can login with admin user (email: admin@nawal.edu.np, password: Admin@123)
- [ ] JWT token stored in localStorage after login
- [ ] Tenant ID (nawal2036) stored in localStorage
- [ ] API calls include Authorization and X-Tenant-ID headers

---

## 🚀 Start Coding!

1. **Read the full guide**: Open `IMPLEMENTATION_PROMPT.md`
2. **Choose a module**: Start with Student or Teacher module
3. **Create components**: Use `ng generate`
4. **Build API services**: Follow patterns above
5. **Test frequently**: Use browser DevTools + NgRx DevTools
6. **Commit often**: Use Git to track progress

---

**Happy Coding! 🎉**
