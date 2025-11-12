import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { StudentDialogComponent } from '../../components/student-dialog/student-dialog.component';

import { StudentService } from '../../../../core/services/api/student.service';
import { Student } from '../../../../core/models/student.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-student-management',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
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
  templateUrl: './student-management.component.html',
  styleUrl: './student-management.component.css'
})
export class StudentManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  totalStudents = 0;
  
  searchTerm = '';
  selectedGrade = 'all';
  selectedStatus = 'all';
  
  grades = [
    { value: 'all', label: 'All Grades' },
    { value: 'KG', label: 'Kindergarten' },
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' }
  ];
  
  statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'GRADUATED', label: 'Graduated' },
    { value: 'TRANSFERRED', label: 'Transferred' }
  ];
  
  activeCount = 0;
  inactiveCount = 0;
  graduatedCount = 0;
  transferredCount = 0;
  
  columns: TableColumn[] = [
    { key: 'studentId', label: 'Student ID', sortable: true },
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'gradeLevel', label: 'Grade', sortable: true },
    { key: 'phoneNumber', label: 'Phone', sortable: false },
    { key: 'enrollmentDate', label: 'Enrollment Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' }
  ];

  actions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewStudentDetails(row)
    },
    {
      icon: 'edit',
      label: 'Edit',
      handler: (row: any) => this.editStudent(row),
      color: 'primary'
    },
    {
      icon: 'delete',
      label: 'Delete',
      handler: (row: any) => this.deleteStudent(row),
      color: 'warn'
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.loading = true;
    
    this.studentService.getAllStudents(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.students = (response.content || []).map((student: Student) => ({
            ...student,
            fullName: `${student.firstName} ${student.lastName}`,
            enrollmentDate: new Date(student.enrollmentDate).toLocaleDateString()
          }));
          
          this.totalStudents = this.students.length;
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading students:', error);
          this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  calculateStatistics(): void {
    this.activeCount = this.students.filter(s => s.status === 'ACTIVE').length;
    this.inactiveCount = this.students.filter(s => s.status === 'INACTIVE').length;
    this.graduatedCount = this.students.filter(s => s.status === 'GRADUATED').length;
    this.transferredCount = this.students.filter(s => s.status === 'TRANSFERRED').length;
  }

  applyFilters(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = !this.searchTerm || 
        student.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesGrade = this.selectedGrade === 'all' || 
        student.gradeLevel === this.selectedGrade;
      
      const matchesStatus = this.selectedStatus === 'all' || 
        student.status === this.selectedStatus;
      
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onGradeChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGrade = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  addStudent(): void {
    const dialogRef = this.dialog.open(StudentDialogComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Student added successfully!', 'Close', { duration: 3000 });
        this.loadStudents();
      }
    });
  }

  viewStudentDetails(student: Student): void {
    // TODO: Future Implementation - Student Detail View
    // Options:
    //   A) Create detail page: ng generate component features/principal/pages/student-detail
    //   B) Create detail dialog: ng generate component features/principal/dialogs/student-detail-dialog
    // Use StudentService.getStudentByUserId() to fetch full details
    this.snackBar.open('Student Details - Page/dialog needed', 'Close', { duration: 3000 });
  }

  editStudent(student: Student): void {
    const dialogRef = this.dialog.open(StudentDialogComponent, {
      width: '800px',
      data: { 
        mode: 'edit',
        student: student
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Student updated successfully!', 'Close', { duration: 3000 });
        this.loadStudents();
      }
    });
  }

  deleteStudent(student: Student): void {
    // API: StudentService.deleteStudent() - Already implemented ✓
    if (confirm(`Delete ${student.firstName} ${student.lastName}?`)) {
      this.studentService.deleteStudent(student.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Student deleted', 'Close', { duration: 3000 });
            this.loadStudents();
          },
          error: (error: any) => {
            this.snackBar.open('Delete failed: ' + error.message, 'Close', { duration: 3000 });
          }
        });
    }
  }

  bulkEnroll(): void {
    // TODO: Future Implementation - Bulk Operations
    // Create dialog for bulk student enrollment/status changes
    this.snackBar.open('Bulk Operations - Dialog needed', 'Close', { duration: 3000 });
  }

  exportStudents(): void {
    // TODO: Future Implementation - Export to CSV/Excel
    // Library: xlsx (npm install xlsx)
    // Export this.filteredStudents to CSV/Excel file
    this.snackBar.open(`Export ${this.filteredStudents.length} students - Feature needed`, 'Close', { duration: 3000 });
  }

  importStudents(): void {
    // TODO: Future Implementation - Import from CSV/Excel
    // Steps:
    // 1. Create import dialog with file upload
    // 2. Parse CSV/Excel file
    // 3. Validate data
    // 4. Create users and students in batch
    this.snackBar.open('Import Students - Dialog needed', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/principal/dashboard']);
  }
}
