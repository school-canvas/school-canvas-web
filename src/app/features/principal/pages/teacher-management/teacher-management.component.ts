import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';

import { TeacherService } from '../../../../core/services/api/teacher.service';
import { Teacher } from '../../../../core/models/teacher.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-teacher-management',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent,
    StatsCardComponent
  ],
  templateUrl: './teacher-management.component.html',
  styleUrl: './teacher-management.component.css'
})
export class TeacherManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  totalTeachers = 0;
  
  searchTerm = '';
  selectedDepartment = 'all';
  selectedStatus = 'all';
  
  departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Science', label: 'Science' },
    { value: 'English', label: 'English' },
    { value: 'Social Studies', label: 'Social Studies' },
    { value: 'Physical Education', label: 'Physical Education' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Music', label: 'Music' },
    { value: 'Computer Science', label: 'Computer Science' }
  ];
  
  statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ON_LEAVE', label: 'On Leave' },
    { value: 'RESIGNED', label: 'Resigned' },
    { value: 'TERMINATED', label: 'Terminated' }
  ];
  
  activeCount = 0;
  inactiveCount = 0;
  onLeaveCount = 0;
  resignedCount = 0;
  
  columns: TableColumn[] = [
    { key: 'employeeId', label: 'Employee ID', sortable: true },
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'joiningDate', label: 'Joining Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' }
  ];

  actions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewTeacherDetails(row)
    },
    {
      icon: 'edit',
      label: 'Edit',
      handler: (row: any) => this.editTeacher(row),
      color: 'primary'
    },
    {
      icon: 'assignment',
      label: 'Assign Classes',
      handler: (row: any) => this.assignClasses(row),
      color: 'primary'
    },
    {
      icon: 'delete',
      label: 'Delete',
      handler: (row: any) => this.deleteTeacher(row),
      color: 'warn'
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeachers(): void {
    this.loading = true;
    
    this.teacherService.getAllTeachers(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.teachers = (response.content || []).map((teacher: Teacher) => ({
            ...teacher,
            fullName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
            joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'N/A',
            department: teacher.department || 'Not Assigned'
          }));
          
          this.totalTeachers = this.teachers.length;
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading teachers:', error);
          this.snackBar.open('Failed to load teachers', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  calculateStatistics(): void {
    this.activeCount = this.teachers.filter(t => t.status === 'ACTIVE').length;
    this.inactiveCount = this.teachers.filter(t => t.status === 'INACTIVE').length;
    this.onLeaveCount = this.teachers.filter(t => t.status === 'ON_LEAVE').length;
    this.resignedCount = this.teachers.filter(t => t.status === 'RESIGNED').length;
  }

  applyFilters(): void {
    this.filteredTeachers = this.teachers.filter(teacher => {
      const matchesSearch = !this.searchTerm || 
        (teacher.firstName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (teacher.lastName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (teacher.email || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (teacher.employeeId && teacher.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesDepartment = this.selectedDepartment === 'all' || 
        teacher.department === this.selectedDepartment;
      
      const matchesStatus = this.selectedStatus === 'all' || 
        teacher.status === this.selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  addTeacher(): void {
    // TODO: Future Implementation - Add Teacher Dialog
    // Service References:
    //   - UserService (core/services/user.service.ts) - For user account creation
    //   - TeacherService (core/services/api/teacher.service.ts) - For teacher profile
    //
    // Steps:
    // 1. ng generate component features/principal/dialogs/add-teacher-dialog
    // 2. Create form with: firstName, lastName, email, password, department, hireDate, qualification, phoneNumber
    // 3. Call UserService to create user account with role 'TEACHER'
    // 4. Then call TeacherService.createTeacher() with userId from step 3
    // 5. Reload list on success
    this.snackBar.open('Add Teacher - Dialog needed', 'Close', { duration: 3000 });
  }

  viewTeacherDetails(teacher: Teacher): void {
    // TODO: Future Implementation - Teacher Detail View
    // Options:
    //   A) Create detail page: ng generate component features/principal/pages/teacher-detail
    //   B) Create detail dialog: ng generate component features/principal/dialogs/teacher-detail-dialog
    // Use TeacherService.getTeacherByUserId() to fetch full details
    // Show: Profile, Classes, Schedule, Performance metrics
    this.snackBar.open('Teacher Details - Page/dialog needed', 'Close', { duration: 3000 });
  }

  editTeacher(teacher: Teacher): void {
    // TODO: Future Implementation - Edit Teacher Dialog
    // Service: TeacherService.updateTeacher(userId, UpdateTeacherRequest)
    // Steps:
    // 1. ng generate component features/principal/dialogs/edit-teacher-dialog
    // 2. Pre-populate form with teacher data
    // 3. Allow updates to: department, qualification, phoneNumber, status, etc.
    // 4. Reload list on success
    this.snackBar.open('Edit Teacher - Dialog needed', 'Close', { duration: 3000 });
  }

  assignClasses(teacher: Teacher): void {
    // TODO: Future Implementation - Assign Classes Dialog
    // Service: ClassService (core/services/api/class.service.ts)
    // Steps:
    // 1. ng generate component features/principal/dialogs/assign-classes-dialog
    // 2. Show list of available classes
    // 3. Allow selection of multiple classes
    // 4. Update class assignments via ClassService
    // 5. Show current teaching load and schedule conflicts
    this.snackBar.open('Assign Classes - Dialog needed', 'Close', { duration: 3000 });
  }

  deleteTeacher(teacher: Teacher): void {
    // API: TeacherService.deleteTeacher() - Already implemented ✓
    if (confirm(`Delete ${teacher.firstName} ${teacher.lastName}?\n\nThis will also remove the associated user account.`)) {
      this.teacherService.deleteTeacher(teacher.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Teacher deleted', 'Close', { duration: 3000 });
            this.loadTeachers();
          },
          error: (error: any) => {
            this.snackBar.open('Delete failed: ' + error.message, 'Close', { duration: 3000 });
          }
        });
    }
  }

  bulkImport(): void {
    // TODO: Future Implementation - Bulk Import Teachers
    // Similar to student import functionality
    // Steps:
    // 1. Create import dialog with file upload
    // 2. Parse CSV/Excel file
    // 3. Validate data (required fields, formats)
    // 4. Create users and teacher profiles in batch
    // 5. Show import results summary
    this.snackBar.open('Import Teachers - Dialog needed', 'Close', { duration: 3000 });
  }

  exportTeachers(): void {
    // TODO: Future Implementation - Export to CSV/Excel
    // Library: xlsx (npm install xlsx)
    // Export this.filteredTeachers to CSV/Excel file
    this.snackBar.open(`Export ${this.filteredTeachers.length} teachers - Feature needed`, 'Close', { duration: 3000 });
  }

  generateReport(): void {
    // TODO: Future Implementation - Teacher Report
    // Service: ReportService (core/services/api/report.service.ts)
    // Generate reports on:
    //   - Teacher workload distribution
    //   - Department staffing
    //   - Performance metrics
    //   - Attendance records
    this.snackBar.open('Generate Report - Feature needed', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/principal/dashboard']);
  }
}
