import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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

import { ClassService } from '../../../../core/services/api/class.service';
import { ClassDTO } from '../../../../core/models/class.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-class-management',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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
  templateUrl: './class-management.component.html',
  styleUrl: './class-management.component.css'
})
export class ClassManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  classes: ClassDTO[] = [];
  filteredClasses: ClassDTO[] = [];
  totalClasses = 0;
  
  // Statistics
  activeClasses = 0;
  fullCapacityClasses = 0;
  lowEnrollmentClasses = 0;
  averageEnrollment = 0;
  
  // Filters
  searchTerm = '';
  selectedSubject = 'all';
  selectedGradeLevel = 'all';
  
  // Filter options
  subjects: string[] = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'];
  gradeLevels: string[] = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  
  // Table configuration
  columns: TableColumn[] = [
    { key: 'className', label: 'Class Name', sortable: true },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'gradeLevel', label: 'Grade Level', sortable: true },
    { key: 'teacherName', label: 'Teacher', sortable: true },
    { key: 'enrollment', label: 'Enrollment', sortable: true },
    { key: 'schedule', label: 'Schedule', sortable: false }
  ];

  actions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewClassDetails(row)
    },
    {
      icon: 'edit',
      label: 'Edit',
      handler: (row: any) => this.editClass(row),
      color: 'primary'
    },
    {
      icon: 'people',
      label: 'Manage Students',
      handler: (row: any) => this.manageStudents(row),
      color: 'primary'
    },
    {
      icon: 'delete',
      label: 'Delete',
      handler: (row: any) => this.deleteClass(row),
      color: 'warn'
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClasses(): void {
    this.loading = true;
    this.classService.getAllClasses(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.classes = (response.content || []).map((classItem: ClassDTO) => ({
            ...classItem,
            enrollment: `${classItem.enrollmentCount || 0}${classItem.maxCapacity ? '/' + classItem.maxCapacity : ''}`,
            schedule: classItem.schedule || 'Not Set',
            teacherName: classItem.teacherName || 'Unassigned'
          }));
          
          this.totalClasses = this.classes.length;
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          this.snackBar.open('Failed to load classes', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  calculateStatistics(): void {
    this.activeClasses = this.classes.length;
    this.fullCapacityClasses = this.classes.filter(c => 
      c.maxCapacity && c.enrollmentCount && c.enrollmentCount >= c.maxCapacity
    ).length;
    this.lowEnrollmentClasses = this.classes.filter(c => 
      c.maxCapacity && c.enrollmentCount && c.enrollmentCount < (c.maxCapacity * 0.5)
    ).length;
    
    const totalEnrollment = this.classes.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
    this.averageEnrollment = this.classes.length > 0 ? Math.round(totalEnrollment / this.classes.length) : 0;
  }

  applyFilters(): void {
    this.filteredClasses = this.classes.filter(classItem => {
      const matchesSearch = !this.searchTerm || 
        (classItem.className || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (classItem.subject || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (classItem.teacherName || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesSubject = this.selectedSubject === 'all' || 
        classItem.subject === this.selectedSubject;
      
      const matchesGrade = this.selectedGradeLevel === 'all' || 
        classItem.gradeLevel === this.selectedGradeLevel;
      
      return matchesSearch && matchesSubject && matchesGrade;
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
    this.selectedSubject = 'all';
    this.selectedGradeLevel = 'all';
    this.applyFilters();
  }

  addClass(): void {
    // TODO: Future Implementation - Add Class Dialog
    // Service References:
    //   - ClassService (core/services/api/class.service.ts) - For class creation
    //   - TeacherService (core/services/api/teacher.service.ts) - To fetch available teachers
    //
    // Steps:
    // 1. ng generate component features/principal/dialogs/add-class-dialog
    // 2. Create form with: className, subject, gradeLevel, teacherId, description, maxCapacity, schedule
    // 3. Load active teachers for teacher dropdown
    // 4. Call ClassService.createClass() with CreateClassRequest
    // 5. Reload list on success
    this.snackBar.open('Add Class - Dialog needed', 'Close', { duration: 3000 });
  }

  viewClassDetails(classItem: ClassDTO): void {
    // TODO: Future Implementation - Class Detail View
    // Options:
    //   A) Navigate to detail page: /principal/classes/:id
    //   B) Create detail dialog
    // Use ClassService.getClassById() to fetch full details
    // Show: Class info, enrolled students, schedule, teacher details, performance metrics
    this.router.navigate(['/principal/classes', classItem.id]);
  }

  editClass(classItem: ClassDTO): void {
    // TODO: Future Implementation - Edit Class Dialog
    // Service: ClassService.updateClass(classId, Partial<CreateClassRequest>)
    // Steps:
    // 1. ng generate component features/principal/dialogs/edit-class-dialog
    // 2. Pre-populate form with class data
    // 3. Allow updates to: className, subject, gradeLevel, teacherId, description, maxCapacity, schedule
    // 4. Reload list on success
    this.snackBar.open('Edit Class - Dialog needed', 'Close', { duration: 3000 });
  }

  manageStudents(classItem: ClassDTO): void {
    // TODO: Future Implementation - Manage Students Dialog
    // Service References:
    //   - ClassService.enrollStudent() - To enroll new students
    //   - StudentService.getAllStudents() - To fetch available students
    //
    // Features:
    // 1. Show currently enrolled students
    // 2. Add new students to class
    // 3. Remove students from class
    // 4. Check capacity before enrollment
    // 5. Show enrollment statistics
    this.snackBar.open('Manage Students - Dialog needed', 'Close', { duration: 3000 });
  }

  deleteClass(classItem: ClassDTO): void {
    // API: ClassService.deleteClass() - Already implemented ✓
    const confirmMessage = `Delete ${classItem.className}?\n\nThis will remove the class and all associated enrollments.`;
    if (confirm(confirmMessage)) {
      this.classService.deleteClass(classItem.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Class deleted successfully', 'Close', { duration: 3000 });
            this.loadClasses();
          },
          error: (error: any) => {
            this.snackBar.open('Delete failed: ' + error.message, 'Close', { duration: 3000 });
          }
        });
    }
  }

  viewSchedule(): void {
    // TODO: Future Implementation - Schedule View
    // Create comprehensive schedule view showing:
    //   - Weekly timetable grid
    //   - Classes by time slot
    //   - Room allocation
    //   - Teacher availability
    //   - Conflict detection
    this.snackBar.open('Schedule View - Feature needed', 'Close', { duration: 3000 });
  }

  bulkImport(): void {
    // TODO: Future Implementation - Bulk Import Classes
    // Steps:
    // 1. Create import dialog with file upload
    // 2. Parse CSV/Excel file with class data
    // 3. Validate data (required fields, teacher existence, capacity limits)
    // 4. Create classes in batch
    // 5. Show import results summary
    this.snackBar.open('Import Classes - Dialog needed', 'Close', { duration: 3000 });
  }

  exportClasses(): void {
    // TODO: Future Implementation - Export to CSV/Excel
    // Library: xlsx (npm install xlsx)
    // Export this.filteredClasses with enrollment details to CSV/Excel file
    this.snackBar.open(`Export ${this.filteredClasses.length} classes - Feature needed`, 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/principal/dashboard']);
  }
}
