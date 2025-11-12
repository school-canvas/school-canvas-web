# 🚀 ENTERPRISE ANGULAR SCHOOL MANAGEMENT SYSTEM - COMPLETE IMPLEMENTATION PROMPT

**Target**: Build a **production-ready, enterprise-grade Angular 19 application** with full feature implementation for all 17+ microservices, role-based access control, real-time communication, state management, and multi-school theming.

---

## 📋 PROJECT OVERVIEW

### Tech Stack
- **Frontend**: Angular 19.2.0 + Angular Material 19.2.6
- **State Management**: NgRx (chosen for enterprise scalability)
- **Styling**: CSS Variables + Angular Material (NO SCSS)
- **Real-time**: WebSocket (STOMP.js + SockJS)
- **Backend**: 17+ Spring Boot microservices (Java 17)
- **Authentication**: JWT with 24-hour expiration
- **Multi-tenancy**: X-Tenant-ID header-based isolation

### User Roles & Routing Strategy
1. **PRINCIPAL** → `/principal/*` (Admin dashboard, all permissions)
2. **TEACHER** → `/teacher/*` (Class management, grading, attendance)
3. **STUDENT** → `/student/*` (View classes, grades, assignments)
4. **PARENT** → `/parent/*` (View child's progress, communicate with teachers)

### Core Principles
- ✅ **NO step-by-step implementation** - Build complete features in one go
- ✅ Use **ng CLI commands** for generation (`ng generate component`, `ng generate service`, etc.)
- ✅ **Component-based architecture** with proper module imports
- ✅ **Standalone components** where applicable, modules for complex features
- ✅ **Smart (Container) + Dumb (Presentational) component pattern**
- ✅ **Facades** to abstract NgRx complexity from components
- ✅ **Resolvers** for pre-loading data before route activation
- ✅ **Custom Validators** for forms
- ✅ **Custom Pipes** for data transformation
- ✅ **Responsive design** with CSS Grid/Flexbox
- ✅ **Accessibility** (ARIA labels, keyboard navigation)
- ✅ **Error handling** with user-friendly messages
- ✅ **Loading states** for all async operations
- ✅ **Optimistic UI updates** where appropriate
- ✅ **TODO markers** for incomplete/future features

---

## 🗂️ COMPLETE API REFERENCE

### ✅ BASELINE COMPLETE
Located in: `/Users/prakashkafle/code/school-canvas/school-canvas-web/src/environments/environment.ts`

```typescript
apiUrls: {
  users: 'http://localhost:8080',         // Port 8080
  tenant: 'http://localhost:8081',        // Port 8081
  student: 'http://localhost:8082',       // Port 8082
  teacher: 'http://localhost:8083',       // Port 8083
  class: 'http://localhost:8084',         // Port 8084
  assessment: 'http://localhost:8085',    // Port 8085
  attendance: 'http://localhost:8086',    // Port 8086
  finance: 'http://localhost:8087',       // Port 8087
  auditLogs: 'http://localhost:8088',     // Port 8088
  guardian: 'http://localhost:8089',      // Port 8089
  scheduler: 'http://localhost:8090',     // Port 8090
  curriculum: 'http://localhost:8091',    // Port 8091
  event: 'http://localhost:8092',         // Port 8092
  notification: 'http://localhost:8093',  // Port 8093
  communication: 'http://localhost:8094', // Port 8094 (WebSocket)
  document: 'http://localhost:8095',      // Port 8095
  report: 'http://localhost:8096',        // Port 8096
  library: 'http://localhost:8097'        // Port 8097
}
```

### 📡 API ENDPOINT MAPPING (From Backend Controllers)

#### 1. USERS SERVICE (Port 8080)
**AuthController** (`/api/v1/auth`)
- `POST /login` - Authenticate user (Public)
- `POST /register/principal` - Register school principal (Public, requires X-Tenant-ID)
- `POST /register/user` - Register teacher/student/parent (Public)
- `PATCH /approve/{userId}` - Approve pending user (PRINCIPAL only)
- `POST /bulk-approve` - Bulk approve users (PRINCIPAL only)

**UserController** (`/api/v1/users`)
- `GET /fetchAllUsers` - Get all users (PRINCIPAL only)
- `GET /fetchUserById/{id}` - Get user by ID (Permission: VIEW_USER)
- `PATCH /approve/{userId}` - Approve user (PRINCIPAL only)
- `POST /create` - Create new user (PRINCIPAL only)

**RoleController** (`/api/v1/roles`)
- `POST /create` - Create role (Permission: CREATE_ROLE)
- `PUT /update/{id}` - Update role (Permission: UPDATE_ROLE)
- `DELETE /delete/{id}` - Delete role (Permission: DELETE_ROLE)
- `GET /getRoleById/{id}` - Get role by ID (Permission: VIEW_ROLES)
- `GET /getAllRoles` - Get all roles (Permission: VIEW_ROLES)

#### 2. TENANT SERVICE (Port 8081)
**TenantController** (`/api/v1/tenants`)
- `POST /create` - Create tenant (Requires X-API-Key header - Super Admin only)
- `GET /exists/{tenantId}` - Validate tenant exists (Public)
- `GET /{tenantId}` - Get tenant by ID (SUPER_ADMIN, ADMIN, PRINCIPAL)
- `GET /schema/{schemaName}` - Get tenant by schema (SUPER_ADMIN, ADMIN)
- `GET ` - Get all tenants with pagination (SUPER_ADMIN only)
- `GET /status/{status}` - Get tenants by status (SUPER_ADMIN only)
- `PUT /{tenantId}` - Update tenant (SUPER_ADMIN, ADMIN)
- `DELETE /{tenantId}` - Deactivate tenant (SUPER_ADMIN only)

#### 3. STUDENT SERVICE (Port 8082)
**StudentController** (`/api/v1/students`)
- `POST /create` - Create student (PRINCIPAL only, requires X-Tenant-ID)
- `GET /{userId}` - Get student by user ID (Permission: VIEW_STUDENT)
- `GET /fetchAllStudents` - Get all students (Permission: VIEW_STUDENT)
- `GET /fetchStudentsByGrade/{gradeLevel}` - Get students by grade (Permission: VIEW_STUDENT)
- `GET /exists/{userId}` - Verify student exists (Public)
- `GET /getName/{userId}` - Get student name (Public)
- `PUT /updateStudent/{userId}` - Update student (PRINCIPAL or TEACHER)
- `DELETE /deleteStudent/{userId}` - Delete student (PRINCIPAL only)

#### 4. TEACHER SERVICE (Port 8083)
**TeacherController** (`/api/v1/teachers`)
- `POST /create` - Create teacher (PRINCIPAL only, requires X-Tenant-ID)
- `GET /user/{userId}` - Get teacher by user ID (Permission: VIEW_TEACHER)
- `GET /employee/{employeeId}` - Get teacher by employee ID (Permission: VIEW_TEACHER)
- `GET /allTeachers` - Get all teachers (Permission: VIEW_TEACHER)
- `GET /status/{status}` - Get teachers by status (Permission: VIEW_TEACHER)
- `PUT /{userId}` - Update teacher (PRINCIPAL only)
- `DELETE /{userId}` - Delete teacher (PRINCIPAL only)

#### 5. CLASS SERVICE (Port 8084)
**ClassController** (`/api/v1/classes`)
- `POST /createClass` - Create class (PRINCIPAL or TEACHER)
- `GET /{classId}` - Get class by ID (Permission: VIEW_CLASS)
- `GET /getAllClasses` - Get all classes (Permission: VIEW_CLASS)
- `GET /teacher/{teacherId}` - Get classes by teacher (Permission: VIEW_CLASS)
- `GET /grade/{gradeLevel}` - Get classes by grade level (Permission: VIEW_CLASS)

**ClassEnrollmentController** (`/api/v1/enrollments`)
- `POST /enrollStudent` - Enroll student in class (PRINCIPAL or TEACHER)
- `DELETE /{classId}/students/{studentId}` - Unenroll student (PRINCIPAL or TEACHER)
- `GET /{classId}/enrollments` - Get class enrollments (Permission: VIEW_CLASS)
- `GET /students/{studentId}/enrollments` - Get student enrollments (Permission: VIEW_CLASS)
- `GET /{classId}/enrollment-count` - Get enrollment count (Permission: VIEW_CLASS)

#### 6. ASSESSMENT SERVICE (Port 8085)
**AssessmentController** (`/api/v1/assessments`)
- `POST /create` - Create assessment (PRINCIPAL, MANAGER, TEACHER)
- `GET /{id}` - Get assessment by ID (Authenticated)
- `GET ` - Get all assessments (PRINCIPAL, MANAGER)
- `GET /class/{classId}` - Get assessments by class (Authenticated)
- `GET /subject/{subjectId}` - Get assessments by subject (Authenticated)
- `GET /class/{classId}/subject/{subjectId}` - Get by class & subject (Authenticated)
- `GET /my-assessments` - Get current user's assessments (TEACHER)
- `GET /active` - Get active assessments (Authenticated)
- `GET /active/class/{classId}` - Get active assessments by class (Authenticated)
- `PUT /{id}` - Update assessment (PRINCIPAL, MANAGER, TEACHER)
- `PUT /{id}/publish` - Publish assessment (PRINCIPAL, MANAGER, TEACHER)

**SubmissionController** (`/api/v1/assessments/submissions`) - Implement full CRUD
**AssessmentQuestionController** (`/api/v1/assessments/questions`) - Implement full CRUD
**QuestionResponseController** (`/api/v1/assessments/responses`) - Implement full CRUD
**AssessmentTypeController** (`/api/v1/assessments/types`) - Implement full CRUD

#### 7. ATTENDANCE SERVICE (Port 8086)
**StudentAttendanceController** (`/api/v1/attendance/students`)
- `POST /mark` - Mark single student attendance (PRINCIPAL or TEACHER)
- `POST /mark-bulk` - Mark bulk attendance (PRINCIPAL or TEACHER)
- `GET /student/{studentId}` - Get student attendance by date range (Roles: PRINCIPAL, TEACHER, STUDENT own, PARENT)
- `GET /student/{studentId}/summary` - Get attendance summary (Roles: PRINCIPAL, TEACHER, STUDENT own, PARENT)
- `GET /class/{classId}` - Get class attendance by date (PRINCIPAL or TEACHER)
- `DELETE /{attendanceId}` - Delete attendance record (PRINCIPAL only)

**TeacherAttendanceController** (`/api/v1/attendance/teachers`) - Implement similar endpoints for teachers

#### 8. FINANCE SERVICE (Port 8087)
**PaymentController** (`/api/v1/finance/payments`)
- `POST ` - Record payment (PRINCIPAL, MANAGER)
- `GET ` - Get all payments (PRINCIPAL, MANAGER, TEACHER)
- `GET /{id}` - Get payment by ID (PRINCIPAL, MANAGER, TEACHER, STUDENT own)
- `GET /invoice/{invoiceId}` - Get payments by invoice (PRINCIPAL, MANAGER, TEACHER, STUDENT own)
- `GET /student/{studentId}` - Get payments by student (PRINCIPAL, MANAGER, TEACHER, STUDENT own)

**InvoiceController** (`/api/v1/finance/invoices`) - Implement full CRUD
**FeeStructureController** (`/api/v1/finance/fee-structures`) - Implement full CRUD
**StudentFeeAssignmentController** (`/api/v1/finance/student-fee-assignments`) - Implement full CRUD
**FeeCategoryController** (`/api/v1/finance/fee-categories`) - Implement full CRUD

#### 9. COMMUNICATION SERVICE (Port 8094) 🔴 **WebSocket Enabled**
**MessageController** (`/api/v1/communication/messages`)
- `POST ` - Send message with optional attachments (Authenticated)
- `GET /{messageId}` - Get message (Authenticated)
- `GET /thread/{threadId}` - Get thread messages with pagination (Authenticated)
- `GET /thread/{threadId}/search` - Search messages (Authenticated)
- `PUT /{messageId}` - Edit message (Authenticated)
- `DELETE /{messageId}` - Delete message (Authenticated)
- `POST /mark-read` - Mark messages as read (Authenticated)
- `GET /unread/{userId}` - Get unread count (Authenticated)

**MessageThreadController** (`/api/v1/communication/threads`) - Implement full CRUD
**AnnouncementController** (`/api/v1/communication/announcements`) - Implement full CRUD
**PresenceController** (`/api/v1/communication/presence`) - Handle online/offline status
**AttachmentController** (`/api/v1/communication/attachments`) - Handle file attachments

**WebSocket Configuration**:
- Endpoint: `ws://localhost:8094/ws`
- Topics:
  - `/topic/messages` - Broadcast messages
  - `/topic/notifications` - Real-time notifications
  - `/topic/presence` - User presence updates
  - `/user/queue` - User-specific messages
- Use STOMP protocol with SockJS fallback

#### 10. NOTIFICATION SERVICE (Port 8093)
**NotificationController** (`/api/v1/notifications`)
- `POST /send` - Send notification (PRINCIPAL, TEACHER, ADMIN)
- `GET /my-notifications` - Get user notifications with pagination (Authenticated)
- `GET /unread` - Get unread notifications (Authenticated)
- `GET /unread-count` - Get unread count (Authenticated)
- `PUT /{notificationId}/read` - Mark as read (Authenticated)
- `PUT /mark-all-read` - Mark all as read (Authenticated)
- `DELETE /{notificationId}` - Delete notification (Authenticated)

**NotificationSettingController** (`/api/v1/notifications/settings`) - Implement CRUD
**NotificationTemplateController** (`/api/v1/notifications/templates`) - Implement CRUD

#### 11. DOCUMENT SERVICE (Port 8095) 📁 **File Upload**
**DocumentController** (`/api/v1/documents`)
- `POST ` - Upload document (multipart/form-data) (PRINCIPAL, TEACHER, ADMIN)
- `GET /{id}` - Get document metadata (Authenticated)
- `GET /{id}/download` - Download document (Authenticated)
- `GET ` - Get all documents with pagination (Authenticated)
- `GET /my-documents` - Get user's documents (Authenticated)
- `GET /search?keyword=` - Search documents (Authenticated)
- `PUT /{id}` - Update document (PRINCIPAL, TEACHER, ADMIN)
- `DELETE /{id}` - Delete document (PRINCIPAL, ADMIN)

**DocumentCategoryController** (`/api/v1/documents/categories`) - Implement CRUD

#### 12. EVENT SERVICE (Port 8092)
**EventController** (`/api/v1/events`)
- `POST ` - Create event (PRINCIPAL, TEACHER, ADMIN)
- `GET /{id}` - Get event by ID (Authenticated)
- `GET ` - Get all events with pagination (Authenticated)
- `GET /my-events` - Get user's events (Authenticated)
- `GET /calendar?start=&end=` - Get events for date range (Authenticated)
- `GET /status/{status}` - Get events by status (Authenticated)
- `GET /category/{categoryId}` - Get events by category (Authenticated)
- `PUT /{id}` - Update event (PRINCIPAL, TEACHER, ADMIN)
- `PUT /{id}/cancel` - Cancel event (PRINCIPAL, TEACHER, ADMIN)

**EventCategoryController** (`/api/v1/events/categories`) - Implement CRUD
**EventParticipantController** (`/api/v1/events/participants`) - Implement CRUD

#### 13. GUARDIAN SERVICE (Port 8089)
**GuardianController** (`/api/v1/guardians`)
- `POST /create` - Create guardian (PRINCIPAL, MANAGER)
- `GET /{userId}` - Get guardian by user ID (PRINCIPAL, MANAGER, GUARDIAN own)
- `GET ` - Get all guardians (PRINCIPAL, MANAGER)
- `PUT /{userId}` - Update guardian (PRINCIPAL, MANAGER, GUARDIAN own)
- `DELETE /{userId}` - Delete guardian (PRINCIPAL, MANAGER)
- `GET /exists/{userId}` - Verify guardian exists (Authenticated)

#### 14. SCHEDULER SERVICE (Port 8090)
**ClassScheduleController** (`/api/v1/{tenantId}/schedules`)
- `POST ` - Create schedule (ADMIN, TEACHER, SCHEDULER_MANAGER)
- `PUT /{id}` - Update schedule (ADMIN, TEACHER, SCHEDULER_MANAGER)
- `GET /{id}` - Get schedule by ID (Authenticated)
- `GET ` - Get all schedules (Authenticated)
- `GET /class/{classId}` - Get schedules by class (Authenticated)
- `GET /teacher/{teacherId}` - Get schedules by teacher (Authenticated)
- `GET /day/{dayOfWeek}` - Get schedules by day (Authenticated)

**AcademicTermController** (`/api/v1/{tenantId}/academic-terms`) - Implement CRUD
**TimeSlotController** (`/api/v1/{tenantId}/time-slots`) - Implement CRUD
**ScheduleExceptionController** (`/api/v1/{tenantId}/schedule-exceptions`) - Implement CRUD

#### 15. CURRICULUM SERVICE (Port 8091)
**SubjectController** (`/api/v1/{tenantId}/subjects`)
- `POST ` - Create subject (ADMIN, TEACHER, CURRICULUM_MANAGER)
- `GET ` - Get all subjects (Authenticated)
- `GET /{id}` - Get subject by ID (Authenticated)
- `PUT /{id}` - Update subject (ADMIN, TEACHER, CURRICULUM_MANAGER)
- `DELETE /{id}` - Delete subject (ADMIN, CURRICULUM_MANAGER)
- `GET /curriculum/{curriculumId}` - Get subjects by curriculum (Authenticated)
- `GET /{id}/topics` - Get subject with topics (Authenticated)
- `GET /status/{status}` - Get subjects by status (Authenticated)

**CurriculumController** (`/api/v1/{tenantId}/curriculums`) - Implement CRUD
**TopicController** (`/api/v1/{tenantId}/topics`) - Implement CRUD
**LearningObjectiveController** (`/api/v1/{tenantId}/learning-objectives`) - Implement CRUD

#### 16. REPORT SERVICE (Port 8096) 📊 **PDF Generation**
**ReportGenerationController** (`/api/v1/reports`)
- `POST /generate` - Generate report (PRINCIPAL, TEACHER, ADMIN)
- `GET /{id}/download` - Download report PDF (Authenticated)
- `GET ` - Get all reports with pagination (Authenticated)
- `GET /my-reports` - Get user's reports (Authenticated)
- `GET /{id}` - Get report metadata (Authenticated)
- `DELETE /{id}` - Delete report (PRINCIPAL, ADMIN)

**ReportTemplateController** (`/api/v1/reports/templates`) - Implement CRUD
**StudentAcademicReportController** (`/api/v1/reports/student-academic`) - Implement student report cards

#### 17. LIBRARY SERVICE (Port 8097)
**BorrowingController** (`/api/v1/{tenantId}/library/borrowings`)
- `POST /checkout` - Checkout book (ADMIN, LIBRARIAN)
- `POST /{id}/return` - Return book (ADMIN, LIBRARIAN)
- `POST /{id}/renew` - Renew borrowing (ADMIN, LIBRARIAN, STUDENT, TEACHER)
- `GET /{id}` - Get borrowing by ID (Authenticated)
- `GET /student/{studentId}` - Get student borrowings (ADMIN, LIBRARIAN, STUDENT, TEACHER)
- `GET /student/{studentId}/active` - Get active borrowings (ADMIN, LIBRARIAN, STUDENT, TEACHER)
- `GET /overdue` - Get overdue borrowings (ADMIN, LIBRARIAN)

**BookController** (`/api/v1/{tenantId}/library/books`) - Implement full CRUD
**BookCopyController** (`/api/v1/{tenantId}/library/book-copies`) - Implement full CRUD
**AuthorController** (`/api/v1/{tenantId}/library/authors`) - Implement CRUD
**PublisherController** (`/api/v1/{tenantId}/library/publishers`) - Implement CRUD
**BookCategoryController** (`/api/v1/{tenantId}/library/categories`) - Implement CRUD
**ReservationController** (`/api/v1/{tenantId}/library/reservations`) - Implement CRUD

#### 18. AUDIT LOGS SERVICE (Port 8088) 🔍 **Read-only**
**AuditLogController** (`/api/v1/audit-logs`)
- `GET ` - Get all audit logs (Read-only, for admins)
- Automatically populated by backend via Kafka
- No CREATE/UPDATE/DELETE from frontend

---

## 🏗️ FOLDER STRUCTURE & ARCHITECTURE

```
src/app/
├── core/                           # ✅ BASELINE COMPLETE
│   ├── guards/
│   │   ├── auth.guard.ts          # ✅ Already exists
│   │   ├── role.guard.ts          # TODO: Create - Role-based access
│   │   └── permission.guard.ts    # TODO: Create - Permission-based access
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts     # ✅ COMPLETE
│   │   ├── tenant.interceptor.ts  # ✅ COMPLETE
│   │   ├── error.interceptor.ts   # ✅ COMPLETE
│   │   └── loading.interceptor.ts # ✅ COMPLETE
│   ├── services/
│   │   ├── auth.service.ts        # ✅ Basic exists - Enhance with full API
│   │   ├── token.service.ts       # ✅ COMPLETE
│   │   ├── loading.service.ts     # ✅ COMPLETE
│   │   ├── notification.service.ts # ✅ COMPLETE
│   │   ├── theme.service.ts       # ✅ COMPLETE
│   │   ├── websocket.service.ts   # ✅ COMPLETE
│   │   └── utility.service.ts     # TODO: Create - Date formatting, file size, etc.
│   └── models/                    # TODO: Create TypeScript interfaces for all DTOs
│       ├── user.model.ts
│       ├── student.model.ts
│       ├── teacher.model.ts
│       ├── class.model.ts
│       ├── assessment.model.ts
│       ├── attendance.model.ts
│       ├── payment.model.ts
│       ├── message.model.ts
│       ├── notification.model.ts
│       ├── document.model.ts
│       ├── event.model.ts
│       ├── report.model.ts
│       └── ... (all other models)
│
├── features/                      # Lazy-loaded feature modules
│   ├── auth/                      # ✅ Basic exists
│   │   ├── login/                 # ✅ Exists - Enhance with forgot password
│   │   ├── register/              # ✅ Exists - Enhance with role selection
│   │   ├── forgot-password/       # TODO: Create
│   │   └── auth.routes.ts
│   │
│   ├── dashboard/                 # ✅ Basic exists - Split by role
│   │   └── dashboard.component.ts # ✅ Exists - Add role detection logic
│   │
│   ├── principal/                 # TODO: CREATE - Principal/Admin module
│   │   ├── dashboard/
│   │   ├── user-management/       # CRUD users, approve pending users
│   │   ├── student-management/    # CRUD students
│   │   ├── teacher-management/    # CRUD teachers
│   │   ├── class-management/      # CRUD classes, enrollments
│   │   ├── finance/               # Fee structures, invoices, payments
│   │   │   ├── fee-structure/
│   │   │   ├── invoices/
│   │   │   └── payments/
│   │   ├── reports/               # Generate reports, view audit logs
│   │   ├── settings/              # School settings, roles, permissions
│   │   └── principal.routes.ts
│   │
│   ├── teacher/                   # TODO: CREATE - Teacher module
│   │   ├── dashboard/
│   │   ├── my-classes/            # View assigned classes
│   │   ├── attendance/            # Mark student attendance
│   │   ├── assessments/           # Create/manage assessments
│   │   │   ├── create-assessment/
│   │   │   ├── view-submissions/
│   │   │   └── grading/
│   │   ├── schedule/              # View teaching schedule
│   │   ├── students/              # View student details
│   │   ├── communication/         # Messages, announcements
│   │   └── teacher.routes.ts
│   │
│   ├── student/                   # TODO: CREATE - Student module
│   │   ├── dashboard/
│   │   ├── my-classes/            # View enrolled classes
│   │   ├── assessments/           # View assignments, submit work
│   │   ├── attendance/            # View own attendance
│   │   ├── grades/                # View grades/report cards
│   │   ├── schedule/              # View class schedule
│   │   ├── library/               # Browse books, view borrowings
│   │   ├── finance/               # View invoices, payment history
│   │   ├── events/                # View school events
│   │   └── student.routes.ts
│   │
│   ├── parent/                    # TODO: CREATE - Parent module
│   │   ├── dashboard/
│   │   ├── children/              # Select child to view
│   │   ├── attendance/            # View child's attendance
│   │   ├── grades/                # View child's grades
│   │   ├── finance/               # View/pay fees
│   │   ├── communication/         # Message teachers
│   │   └── parent.routes.ts
│   │
│   ├── communication/             # TODO: CREATE - Shared messaging module
│   │   ├── inbox/
│   │   ├── compose/
│   │   ├── announcements/
│   │   └── communication.routes.ts
│   │
│   ├── library/                   # TODO: CREATE - Library module
│   │   ├── books/
│   │   ├── borrowings/
│   │   ├── reservations/
│   │   └── library.routes.ts
│   │
│   ├── events/                    # TODO: CREATE - Events & calendar module
│   │   ├── calendar-view/
│   │   ├── event-list/
│   │   ├── event-details/
│   │   └── events.routes.ts
│   │
│   └── profile/                   # TODO: CREATE - User profile module
│       ├── view-profile/
│       ├── edit-profile/
│       └── change-password/
│
├── shared/                        # Shared components, pipes, directives
│   ├── components/
│   │   ├── loading-spinner/       # ✅ COMPLETE
│   │   ├── error-message/         # ✅ COMPLETE
│   │   ├── confirmation-dialog/   # ✅ COMPLETE
│   │   ├── theme-toggle/          # ✅ COMPLETE
│   │   ├── page-header/           # TODO: Create - Reusable page header
│   │   ├── data-table/            # TODO: Create - Generic table with sorting/pagination
│   │   ├── empty-state/           # TODO: Create - No data placeholder
│   │   ├── avatar/                # TODO: Create - User avatar with initials fallback
│   │   ├── breadcrumb/            # TODO: Create - Navigation breadcrumb
│   │   ├── card/                  # TODO: Create - Reusable card wrapper
│   │   └── stats-card/            # TODO: Create - Dashboard stats widget
│   ├── pipes/
│   │   ├── date-format.pipe.ts    # TODO: Create - Custom date formatting
│   │   ├── file-size.pipe.ts      # TODO: Create - Format bytes to KB/MB
│   │   ├── time-ago.pipe.ts       # TODO: Create - "5 minutes ago"
│   │   └── truncate.pipe.ts       # TODO: Create - Truncate long text
│   ├── directives/
│   │   ├── autofocus.directive.ts # TODO: Create - Auto-focus on load
│   │   └── permission.directive.ts # TODO: Create - Show/hide by permission
│   └── validators/
│       ├── password-match.validator.ts  # TODO: Create
│       ├── phone.validator.ts           # TODO: Create
│       └── email.validator.ts           # TODO: Create
│
├── state/                         # NgRx State Management
│   ├── auth/
│   │   ├── auth.actions.ts
│   │   ├── auth.reducer.ts
│   │   ├── auth.effects.ts
│   │   ├── auth.selectors.ts
│   │   └── auth.facade.ts         # Facade to abstract NgRx
│   ├── student/
│   │   ├── student.actions.ts
│   │   ├── student.reducer.ts
│   │   ├── student.effects.ts
│   │   ├── student.selectors.ts
│   │   └── student.facade.ts
│   ├── teacher/
│   ├── class/
│   ├── assessment/
│   ├── attendance/
│   ├── finance/
│   ├── communication/
│   ├── notification/
│   ├── event/
│   ├── library/
│   └── app.state.ts               # Root state interface
│
├── layouts/
│   ├── auth-layout/               # ✅ Exists
│   ├── main-layout/               # ✅ Exists - Add theme toggle, notifications
│   ├── principal-layout/          # TODO: Create - Admin sidebar
│   ├── teacher-layout/            # TODO: Create - Teacher sidebar
│   ├── student-layout/            # TODO: Create - Student sidebar
│   └── parent-layout/             # TODO: Create - Parent sidebar
│
└── assets/
    ├── images/
    │   ├── school-logo.png        # ✅ Already exists
    │   └── school-image.png       # ✅ Already exists
    └── icons/

```

---

## 🎯 IMPLEMENTATION STRATEGY

### Phase 1: NgRx State Management Setup (PRIORITY 1)
1. Install NgRx:
   ```bash
   ng add @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
   ```

2. Create root state in `state/app.state.ts`:
   ```typescript
   export interface AppState {
     auth: AuthState;
     students: StudentState;
     teachers: TeacherState;
     classes: ClassState;
     // ... other feature states
   }
   ```

3. Create Auth state first (pattern for all others):
   ```
   state/auth/
   ├── auth.actions.ts     # Login, Logout, Register, RefreshToken
   ├── auth.reducer.ts     # Manage user, token, loading, error states
   ├── auth.effects.ts     # Side effects: API calls, WebSocket connect
   ├── auth.selectors.ts   # Select user, isLoggedIn, userRole, etc.
   └── auth.facade.ts      # Public API for components
   ```

4. **Facade Pattern Example**:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class AuthFacade {
     user$ = this.store.select(selectUser);
     isLoggedIn$ = this.store.select(selectIsLoggedIn);
     userRole$ = this.store.select(selectUserRole);
     
     login(credentials) { this.store.dispatch(AuthActions.login({ credentials })); }
     logout() { this.store.dispatch(AuthActions.logout()); }
   }
   ```

### Phase 2: Role-Based Routing & Guards (PRIORITY 2)
1. Create `role.guard.ts`:
   ```typescript
   export const roleGuard: CanActivateFn = (route, state) => {
     const tokenService = inject(TokenService);
     const router = inject(Router);
     const requiredRoles = route.data['roles'] as string[];
     const userRoles = tokenService.getUserRoles();
     
     if (requiredRoles.some(role => userRoles.includes(role))) {
       return true;
     }
     
     router.navigate(['/unauthorized']);
     return false;
   };
   ```

2. Update `app.routes.ts`:
   ```typescript
   export const routes: Routes = [
     { path: '', component: HomeComponent },
     { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
     { 
       path: 'principal', 
       canActivate: [authGuard, roleGuard],
       data: { roles: ['PRINCIPAL'] },
       loadChildren: () => import('./features/principal/principal.routes')
     },
     { 
       path: 'teacher', 
       canActivate: [authGuard, roleGuard],
       data: { roles: ['TEACHER'] },
       loadChildren: () => import('./features/teacher/teacher.routes')
     },
     { 
       path: 'student', 
       canActivate: [authGuard, roleGuard],
       data: { roles: ['STUDENT'] },
       loadChildren: () => import('./features/student/student.routes')
     },
     { 
       path: 'parent', 
       canActivate: [authGuard, roleGuard],
       data: { roles: ['PARENT'] },
       loadChildren: () => import('./features/parent/parent.routes')
     }
   ];
   ```

3. Dashboard role detection:
   ```typescript
   // In dashboard.component.ts
   ngOnInit() {
     const role = this.tokenService.getUserRoles()[0];
     switch(role) {
       case 'PRINCIPAL': this.router.navigate(['/principal/dashboard']); break;
       case 'TEACHER': this.router.navigate(['/teacher/dashboard']); break;
       case 'STUDENT': this.router.navigate(['/student/dashboard']); break;
       case 'PARENT': this.router.navigate(['/parent/dashboard']); break;
     }
   }
   ```

### Phase 3: Principal Module - Complete Implementation (PRIORITY 3)

#### 3.1 Principal Dashboard
- **Components**: Stats cards (total students, teachers, classes, pending approvals)
- **Charts**: Attendance trends, enrollment by grade, fee collection status
- **Recent Activity**: Latest registrations, payments, events
- **Quick Actions**: Approve users, create student, generate report

#### 3.2 User Management
- **List Component**: Table with filtering, sorting, pagination
  - Columns: Name, Email, Role, Status, Created Date, Actions
  - Filters: Role, Status (Active/Pending/Inactive)
  - Actions: View, Edit, Approve (if pending), Deactivate
- **Create/Edit Component**: Reactive form with validation
  - Fields: First/Last Name, Email, Phone, Role, Permissions
  - Validators: Required, email format, phone format
- **Bulk Approval**: Multi-select table rows, bulk approve button

#### 3.3 Student Management
- **List Component**: Data table with search, filters
  - Columns: Name, Grade, Class, Guardian, Status, Actions
  - Filters: Grade level, Class, Status
  - Search: By name, email, student ID
- **Create Component**: Multi-step form
  - Step 1: Personal Info (Name, DOB, Gender, Photo upload)
  - Step 2: Guardian Info (Select existing or create new)
  - Step 3: Academic Info (Grade, Section, Enrollment date)
  - Step 4: Medical Info (Blood type, allergies - optional)
- **View/Edit Component**: Tabs
  - Tab 1: Personal Details
  - Tab 2: Academic Records
  - Tab 3: Attendance Summary
  - Tab 4: Fee Status
  - Tab 5: Disciplinary Records

#### 3.4 Teacher Management
- Similar structure to Student Management
- Additional fields: Employee ID, Department, Subjects taught, Qualifications

#### 3.5 Class Management
- **List Component**: Card-based layout
  - Each card: Class name, Teacher, Grade, Student count, Schedule link
- **Create/Edit Component**:
  - Fields: Class name, Grade level, Section, Teacher (dropdown), Room number
  - Capacity limit
- **Enrollment Management**:
  - View enrolled students
  - Add students (multi-select from available students)
  - Remove students (with confirmation)
  - Transfer students between classes

#### 3.6 Finance Module
- **Fee Structure**: Define fee types, amounts, due dates
- **Invoice Management**: Generate invoices for students
- **Payment Processing**: Record payments, view history
- **Reports**: Outstanding fees, collection reports

#### 3.7 Reports & Audit Logs
- **Report Generator**: Select report type, date range, filters, generate PDF
- **Audit Log Viewer**: Read-only table showing all system activities

### Phase 4: Teacher Module - Complete Implementation (PRIORITY 4)

#### 4.1 Teacher Dashboard
- **My Classes**: List of assigned classes with quick links
- **Today's Schedule**: Timetable for the day
- **Pending Tasks**: Grading queue, attendance to mark
- **Announcements**: Recent school announcements

#### 4.2 Attendance Management
- **Mark Attendance Component**:
  - Select class, date
  - Student list with Present/Absent/Late/Excused radio buttons
  - Bulk actions: Mark all present
  - Submit with confirmation
- **View Attendance**: Calendar view with color-coded days

#### 4.3 Assessment Management
- **Create Assessment**:
  - Type: Quiz, Assignment, Exam, Project
  - Class, Subject, Due date
  - Total marks
  - Instructions (rich text editor - TODO: Integrate library like ngx-quill)
  - Attachments (file upload)
- **View Submissions**:
  - Table: Student name, Submission date, Status (Submitted/Pending)
  - Download attachments
  - Grade submission: Enter marks, feedback, save
- **Grade Book**: Table view of all students' grades for all assessments

#### 4.4 My Classes
- **Class Details**: Student list, schedule, curriculum
- **Student Performance**: Individual student progress

#### 4.5 Communication
- **Messages**: Inbox, sent, compose (integrated with communication module)
- **Announcements**: Create class/school announcements

### Phase 5: Student Module - Complete Implementation (PRIORITY 5)

#### 5.1 Student Dashboard
- **Upcoming Assessments**: Deadlines, due dates
- **Recent Grades**: Latest graded work
- **Attendance Summary**: Percentage, recent absences
- **Schedule**: Today's classes
- **Notifications**: New messages, announcements

#### 5.2 My Classes
- **List View**: Enrolled classes with teacher info
- **Class Details**: Curriculum, upcoming lessons

#### 5.3 Assessments
- **Active Assessments**: View instructions, submit work
- **Past Assessments**: View grades, feedback
- **Submission Component**:
  - Upload file (if required)
  - Text submission (if essay/written work)
  - Submit button with confirmation

#### 5.4 Grades & Report Cards
- **Grade Book**: Table view of all assessments
- **Report Cards**: View/download PDF report cards

#### 5.5 Attendance
- **Attendance Calendar**: Color-coded (green=present, red=absent, yellow=late)
- **Summary Stats**: Attendance percentage by month

#### 5.6 Library
- **Browse Books**: Search, filter by category, author
- **My Borrowings**: Active loans, due dates, renew option
- **Reservations**: Reserve books that are currently checked out

#### 5.7 Finance
- **Invoices**: View pending/paid invoices
- **Payment History**: List of past payments
- **Pay Online**: TODO marker (integrate payment gateway later)

#### 5.8 Schedule
- **Timetable View**: Weekly schedule grid
- **Calendar View**: Monthly view with classes

### Phase 6: Parent Module - Complete Implementation (PRIORITY 6)

#### 6.1 Parent Dashboard
- **Children Selector**: Dropdown if multiple children
- **Child's Summary**: Attendance, grades, fees, upcoming events

#### 6.2 Attendance
- View child's attendance (same as student view)

#### 6.3 Grades
- View child's grades and report cards

#### 6.4 Finance
- View invoices, payment history
- Pay fees (TODO: payment gateway integration)

#### 6.5 Communication
- Message teachers
- View school announcements

### Phase 7: Communication & Real-time Features (PRIORITY 7)

#### 7.1 WebSocket Integration
- Connect WebSocket on login in auth.effects.ts:
  ```typescript
  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ user }) => {
      this.webSocketService.connect(user.id);
      this.webSocketService.subscribeToUserQueue(user.id, (message) => {
        this.store.dispatch(MessageActions.newMessageReceived({ message }));
      });
    })
  ), { dispatch: false });
  ```

#### 7.2 Messaging System
- **Inbox**: List of message threads
- **Thread View**: Chat-style message display
- **Compose**: Select recipient (teacher/student/parent), subject, message, attachments
- **Real-time Updates**: New messages appear instantly via WebSocket

#### 7.3 Announcements
- **List View**: School-wide and class-specific announcements
- **Create**: Rich text editor, target audience (All, Class, Grade)

#### 7.4 Notifications
- **Notification Bell**: Icon in header with unread count badge
- **Dropdown**: Recent notifications, mark as read
- **Notification Center**: Full list with pagination
- **Types**: New message, grade posted, attendance marked, fee due, event reminder

### Phase 8: Shared Components Library (PRIORITY 8)

#### 8.1 Data Table Component
- **Features**: Sorting, pagination, filtering, row selection, actions column
- **Usage**: Reuse across all list views
- **Input**: Columns config, data array, actions
- **Output**: Row click, action click events

#### 8.2 Form Components
- **Date Picker**: Material datepicker wrapper
- **File Upload**: Drag-drop area, file preview, validation
- **Rich Text Editor**: TODO marker (integrate library)
- **Multi-Select**: Chips-based multi-select

#### 8.3 UI Components
- **Page Header**: Breadcrumb, title, actions (buttons)
- **Stats Card**: Icon, label, value, trend indicator
- **Empty State**: Icon, message, call-to-action
- **Avatar**: User photo or initials, status indicator (online/offline)

### Phase 9: Theming & Multi-School Support (PRIORITY 9)

#### 9.1 Theme Toggle
- **Component**: Already created (`theme-toggle.component.ts`)
- **Usage**: Add to header in all layouts
- **Persistence**: Theme saved in localStorage

#### 9.2 Multi-School Theming
- **Primary Color Customization**:
  - Each school has unique primary color in database/config
  - On login, fetch school config from `application-config.ts` or API
  - Dynamically update CSS variables:
    ```typescript
    document.documentElement.style.setProperty('--primary-color', schoolConfig.primaryColor);
    ```
- **Logo**: Load from `assets/images/school-logo.png` or school-specific URL
- **School Info**: Name, address, contact from `application-config.ts`

### Phase 10: File Uploads & Documents (PRIORITY 10)

#### 10.1 Document Upload Component
- **Features**: Drag-drop, multi-file, file type validation, size limit (10MB)
- **Preview**: Show selected files before upload
- **Progress**: Upload progress bar
- **API**: Multipart/form-data POST to `/api/v1/documents`

#### 10.2 Document List & Download
- **List**: Table with filename, size, uploaded by, uploaded date, actions
- **Download**: GET `/api/v1/documents/{id}/download`
- **Search**: Filter by keyword, category, date range

### Phase 11: Reports & Analytics (PRIORITY 11)

#### 11.1 Report Generator
- **Form**:
  - Report type: Attendance, Grades, Fee Collection, Student List
  - Date range
  - Filters: Grade, Class, Student
  - Format: PDF (default)
- **API**: POST `/api/v1/reports/generate`
- **Download**: GET `/api/v1/reports/{id}/download`

#### 11.2 Dashboard Analytics
- **Charts**: Use Chart.js or ng2-charts
  - Attendance trends (line chart)
  - Enrollment by grade (bar chart)
  - Fee collection (pie chart)
- **Stats**: Total students, teachers, classes, active users

### Phase 12: Error Handling & Loading States (PRIORITY 12)

#### 12.1 Error Handling
- **Global Error Interceptor**: Already created
- **Component-Level Error States**:
  ```typescript
  error$ = this.facade.error$;  // From NgRx state
  ```
- **Display**: Use `<app-error-message [message]="error$ | async">` component

#### 12.2 Loading States
- **Global Loader**: Already created (`loading-spinner.component`)
- **Component-Level Loaders**:
  ```typescript
  loading$ = this.facade.loading$;
  ```
- **Display**: `*ngIf="loading$ | async"` with skeleton screens or spinners

### Phase 13: Accessibility & Responsiveness (PRIORITY 13)

#### 13.1 Accessibility
- **ARIA Labels**: Add to all interactive elements
- **Keyboard Navigation**: Ensure all features accessible via keyboard
- **Focus Management**: Trap focus in dialogs, manage focus on route changes
- **Screen Reader Support**: Announce dynamic content updates

#### 13.2 Responsive Design
- **Mobile-First**: Design for mobile, enhance for desktop
- **Breakpoints**: Use CSS media queries
- **Mobile Menu**: Hamburger menu for mobile navigation
- **Touch-Friendly**: Larger tap targets on mobile

---

## 🔧 TECHNICAL PATTERNS & BEST PRACTICES

### NgRx Architecture
```
Component
   ↓ (dispatch action)
Facade
   ↓ (dispatch action)
Store → Reducer → New State
   ↓ (trigger effect)
Effect → API Call → Success/Failure Action
   ↓
Store → Reducer → Updated State
   ↓ (select)
Component (via facade)
```

### Smart vs Dumb Components
- **Smart (Container)**: Inject facades, dispatch actions, handle business logic
- **Dumb (Presentational)**: @Input/@Output only, pure display logic

### Form Handling
- **Reactive Forms**: Use FormBuilder, FormGroup, FormControl
- **Validation**: Built-in validators + custom validators
- **Error Display**: Show validation errors below fields
- **Disable Submit**: Disable button when form invalid

### API Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private baseUrl = environment.apiUrls.student;
  
  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/api/v1/students/fetchAllStudents`);
  }
  
  getById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/api/v1/students/${id}`);
  }
  
  create(student: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/api/v1/students/create`, student);
  }
  
  update(id: string, student: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/api/v1/students/updateStudent/${id}`, student);
  }
  
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/students/deleteStudent/${id}`);
  }
}
```

### Resolver Pattern (Pre-load Data)
```typescript
export const studentResolver: ResolveFn<Student> = (route, state) => {
  const studentService = inject(StudentApiService);
  const studentId = route.paramMap.get('id')!;
  return studentService.getById(studentId);
};
```

### Custom Validators
```typescript
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  };
}
```

### Custom Pipes
```typescript
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
```

---

## 📝 TODO MARKERS & FUTURE ENHANCEMENTS

### Critical TODOs (Mark in code with comments)
```typescript
// TODO: Implement payment gateway integration (Stripe/Razorpay)
// TODO: Add rich text editor for announcements (integrate ngx-quill or similar)
// TODO: Implement file compression before upload
// TODO: Add offline support with service workers
// TODO: Implement JWT token refresh logic
// TODO: Add end-to-end tests with Cypress
// TODO: Implement lazy loading for images
// TODO: Add PWA manifest for mobile install
// TODO: Implement dark mode for all charts
// TODO: Add email/SMS notifications (backend integration needed)
```

### Nice-to-Have Features (Future Phases)
- Video conferencing integration (Zoom/Google Meet links)
- Assignment plagiarism checker
- AI-powered grade predictions
- Parent-teacher meeting scheduler
- Alumni portal
- Online exam proctoring
- Gamification (badges, leaderboards for students)

---

## 🚀 EXECUTION CHECKLIST

### Before Starting
- [ ] Read this entire document thoroughly
- [ ] Understand NgRx architecture
- [ ] Review all backend API endpoints
- [ ] Set up NgRx DevTools in browser
- [ ] Confirm all baseline files are in place

### Development Workflow
1. **Create Feature Branch**: `git checkout -b feature/principal-module`
2. **Generate Components**: Use `ng generate component features/principal/dashboard`
3. **Create State**: Actions, Reducer, Effects, Selectors, Facade
4. **Build API Service**: Follow API service pattern
5. **Build Components**: Smart container + Dumb presentational
6. **Add Routing**: Update feature routes
7. **Test in Browser**: Verify with NgRx DevTools
8. **Commit**: `git commit -m "feat: principal dashboard complete"`
9. **Repeat** for next feature

### Quality Gates
- [ ] No console errors in browser
- [ ] All forms have validation
- [ ] Loading states shown during API calls
- [ ] Errors displayed to user
- [ ] Responsive design verified (desktop, tablet, mobile)
- [ ] Accessibility: Keyboard navigation works
- [ ] Code follows Angular style guide
- [ ] TODO markers added where needed

---

## 🎨 UI/UX GUIDELINES

### Design Decisions
- **Tables vs Cards**: 
  - Use **tables** for: User lists, student lists, attendance records, payments
  - Use **cards** for: Dashboards, class listings, event listings
- **Modals vs Routes**: 
  - Use **modals** for: Quick actions (mark attendance, send message)
  - Use **routes** for: Full CRUD forms (create student, edit teacher)
- **Forms**:
  - Single column on mobile
  - Two columns on desktop
  - Group related fields
  - Use Material form fields consistently

### Color Usage
- **Primary**: Main actions (Save, Submit, Create)
- **Accent**: Secondary actions (Edit, View)
- **Warn**: Destructive actions (Delete, Cancel)
- **Success**: Positive feedback (Approved, Paid)
- **Warning**: Alerts (Pending approval, Due soon)
- **Error**: Negative feedback (Failed, Overdue)

### Typography
- **Headings**: Use Material typography classes (`mat-h1`, `mat-h2`, etc.)
- **Body Text**: Use CSS variables (`var(--font-size-base)`)
- **Labels**: Use `<mat-label>` in forms

### Spacing
- **Sections**: `var(--spacing-lg)` between major sections
- **Form Fields**: `var(--spacing-md)` between fields
- **Buttons**: `var(--spacing-sm)` gap between multiple buttons

---

## 🔥 FINAL NOTES

### Critical Reminders
1. **Tenant ID**: ALWAYS send `X-Tenant-ID` header (interceptor handles this)
2. **JWT Token**: ALWAYS send `Authorization: Bearer <token>` (interceptor handles this)
3. **Error Handling**: NEVER leave API calls without error handling
4. **Loading States**: ALWAYS show loading indicator for async operations
5. **Logout**: Clear localStorage, disconnect WebSocket, navigate to login
6. **File Uploads**: Use `multipart/form-data`, validate file size/type client-side
7. **Date Handling**: Use ISO 8601 format for API calls, localize for display
8. **Pagination**: Use Material paginator, send `page` and `size` query params
9. **Search/Filter**: Debounce input (500ms) before API call
10. **WebSocket**: Connect on login, disconnect on logout

### Performance Optimization
- Use `trackBy` in `*ngFor` loops
- Lazy load feature modules
- Use OnPush change detection strategy where possible
- Unsubscribe from observables in `ngOnDestroy`
- Use async pipe instead of manual subscriptions
- Optimize images (compress, use appropriate formats)

### Security Considerations
- Never store sensitive data in localStorage (only JWT token)
- Validate all user input client-side
- Sanitize HTML content from rich text editors
- Use parameterized queries in search (backend responsibility, but verify)
- Implement CSRF protection if needed (backend responsibility)

### Deployment Preparation
- Update `environment.prod.ts` with production API URLs
- Enable production mode in Angular (`ng build --configuration production`)
- Set up CI/CD pipeline
- Configure CORS on backend for production domain
- Set up SSL certificates
- Monitor error tracking (integrate Sentry or similar)

---

## 🎯 SUCCESS CRITERIA

### A Fully Functional Feature Includes:
- ✅ NgRx state management (actions, reducer, effects, selectors, facade)
- ✅ API service with all CRUD operations
- ✅ Smart container component
- ✅ Dumb presentational components
- ✅ Reactive forms with validation
- ✅ Error handling and display
- ✅ Loading states
- ✅ Responsive design
- ✅ Accessibility features
- ✅ Routing and navigation
- ✅ TODO markers for incomplete parts

---

## 📞 IMPLEMENTATION APPROACH

When implementing this system:
1. **Start with NgRx setup** - This is the foundation
2. **Build one role module completely** (recommend starting with STUDENT as it's simpler)
3. **Reuse patterns** for other role modules
4. **Integrate WebSocket** after basic features work
5. **Polish UI/UX** in final phase
6. **Add analytics/reports** last

**DO NOT**:
- Try to build everything at once
- Skip error handling
- Forget loading states
- Ignore responsiveness
- Leave TODO markers undocumented

**ALWAYS**:
- Follow the folder structure
- Use facades to abstract NgRx
- Write reusable components
- Add accessibility attributes
- Test in different screen sizes

---

**NOW GO BUILD THE BEST SCHOOL MANAGEMENT SYSTEM! 🚀**

---

## 📎 APPENDIX: QUICK REFERENCE

### Key Files to Know
- `environment.ts` - All API URLs
- `application-config.ts` - School-specific config
- `app.config.ts` - App providers, interceptors
- `app.routes.ts` - Root routing
- `styles.css` - Theme variables
- `material.module.ts` - Material imports (if using module approach)

### Useful Commands
```bash
# Generate component
ng g c features/principal/dashboard --standalone

# Generate service
ng g s core/services/utility

# Generate guard
ng g guard core/guards/permission --functional

# Generate pipe
ng g pipe shared/pipes/time-ago --standalone

# Generate resolver
ng g resolver core/resolvers/student --functional

# Run dev server
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test

# Run linter
ng lint
```

### Material Components Used
- MatTableModule (data tables)
- MatPaginatorModule (pagination)
- MatSortModule (sorting)
- MatFormFieldModule (form inputs)
- MatInputModule (text inputs)
- MatSelectModule (dropdowns)
- MatDatepickerModule (date inputs)
- MatButtonModule (buttons)
- MatIconModule (icons)
- MatCardModule (cards)
- MatDialogModule (modals)
- MatSnackBarModule (notifications)
- MatProgressSpinnerModule (loading)
- MatChipsModule (tags)
- MatTabsModule (tabs)
- MatMenuModule (menus)
- MatToolbarModule (header)
- MatSidenavModule (sidebar)
- MatListModule (lists)
- MatBadgeModule (notification badges)
- MatTooltipModule (tooltips)

---

**END OF COMPREHENSIVE IMPLEMENTATION PROMPT**
