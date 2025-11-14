import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { ClassService } from '../../../../core/services/api/class.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  subject: string;
  gradeLevel: string;
}

interface StudentAttendance {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  email: string;
  status: AttendanceStatus;
  notes?: string;
}

@Component({
  selector: 'app-take-attendance',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatButtonToggleModule,
    PageHeaderComponent,
    StatsCardComponent
  ],
  templateUrl: './take-attendance.component.html',
  styleUrl: './take-attendance.component.css'
})
export class TakeAttendanceComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  saving = false;
  classId: string = '';
  classInfo: ClassInfo | null = null;
  selectedDate: Date = new Date();
  students: StudentAttendance[] = [];
  hasUnsavedChanges = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private classService: ClassService,
    private studentService: StudentService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.classId = params['id'];
        if (this.classId) {
          this.loadClassData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClassData(): void {
    this.loading = true;

    // Mock data - replace with actual API calls
    setTimeout(() => {
      this.classInfo = this.generateMockClassInfo();
      this.students = this.generateMockStudents();
      this.loading = false;
    }, 500);
  }

  generateMockClassInfo(): ClassInfo {
    return {
      id: this.classId,
      name: 'Grade 10 Mathematics',
      section: 'A',
      subject: 'Mathematics',
      gradeLevel: 'Grade 10'
    };
  }

  generateMockStudents(): StudentAttendance[] {
    const students: StudentAttendance[] = [];
    for (let i = 1; i <= 25; i++) {
      students.push({
        id: `student-${i}`,
        userId: `user-${i}`,
        firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa'][i % 8],
        lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][i % 8],
        rollNumber: `2024${String(i).padStart(3, '0')}`,
        email: `student${i}@school.com`,
        status: 'PRESENT' // Default status
      });
    }
    return students;
  }

  // Date handling
  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadAttendanceForDate();
  }

  loadAttendanceForDate(): void {
    // In real implementation, load saved attendance for this date
    // For now, check if it's today - if not, load saved data
    const isToday = this.isToday(this.selectedDate);
    
    if (!isToday) {
      // Simulate loading previously saved attendance
      this.students.forEach(student => {
        const rand = Math.random();
        if (rand < 0.85) student.status = 'PRESENT';
        else if (rand < 0.90) student.status = 'LATE';
        else if (rand < 0.95) student.status = 'EXCUSED';
        else student.status = 'ABSENT';
      });
    } else {
      // Reset to default for today
      this.students.forEach(student => student.status = 'PRESENT');
    }
    
    this.hasUnsavedChanges = false;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  // Status management
  setStudentStatus(student: StudentAttendance, status: AttendanceStatus): void {
    student.status = status;
    this.hasUnsavedChanges = true;
  }

  markAllPresent(): void {
    this.students.forEach(student => student.status = 'PRESENT');
    this.hasUnsavedChanges = true;
    this.snackBar.open('All students marked as present', 'Close', { duration: 2000 });
  }

  markAllAbsent(): void {
    this.students.forEach(student => student.status = 'ABSENT');
    this.hasUnsavedChanges = true;
    this.snackBar.open('All students marked as absent', 'Close', { duration: 2000 });
  }

  // Statistics
  getStatusCount(status: AttendanceStatus): number {
    return this.students.filter(s => s.status === status).length;
  }

  getAttendanceRate(): string {
    const present = this.getStatusCount('PRESENT') + this.getStatusCount('LATE');
    const total = this.students.length;
    return total > 0 ? ((present / total) * 100).toFixed(1) : '0';
  }

  // Save functionality
  saveAttendance(): void {
    if (!this.hasUnsavedChanges) {
      this.snackBar.open('No changes to save', 'Close', { duration: 2000 });
      return;
    }

    this.saving = true;

    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      this.hasUnsavedChanges = false;
      this.snackBar.open('Attendance saved successfully!', 'Close', { duration: 3000 });
    }, 1000);
  }

  saveAndReturn(): void {
    if (this.hasUnsavedChanges) {
      this.saving = true;
      
      // Simulate API call
      setTimeout(() => {
        this.saving = false;
        this.hasUnsavedChanges = false;
        this.snackBar.open('Attendance saved successfully!', 'Close', { duration: 2000 });
        this.goBack();
      }, 1000);
    } else {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/teacher/classes', this.classId]);
  }

  // Utility methods
  getStudentName(student: StudentAttendance): string {
    return `${student.firstName} ${student.lastName}`;
  }

  getStatusIcon(status: AttendanceStatus): string {
    const icons: { [key in AttendanceStatus]: string } = {
      'PRESENT': 'check_circle',
      'ABSENT': 'cancel',
      'LATE': 'schedule',
      'EXCUSED': 'verified'
    };
    return icons[status];
  }

  getStatusClass(status: AttendanceStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
