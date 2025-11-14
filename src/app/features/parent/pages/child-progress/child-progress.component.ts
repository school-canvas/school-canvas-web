import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { StudentService } from '../../../../core/services/api/student.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { Student, StudentAttendance, AttendanceSummary, Submission } from '../../../../core/models';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-child-progress',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatTableModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatsCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './child-progress.component.html',
  styleUrl: './child-progress.component.css'
})
export class ChildProgressComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  studentId: string | null = null;
  student: Student | null = null;
  
  // Attendance Data
  attendanceSummary: AttendanceSummary | null = null;
  recentAttendance: StudentAttendance[] = [];
  attendanceDisplayColumns = ['date', 'status', 'remarks'];
  
  // Assessment Data
  recentSubmissions: Submission[] = [];
  submissionsDisplayColumns = ['assessmentTitle', 'submittedDate', 'marksObtained', 'status'];
  
  // Stats
  averageGrade = 0;
  totalAssessments = 0;
  completedAssessments = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private assessmentService: AssessmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Note: Route param 'id' is actually the userId (Student.userId)
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.loadChildProgress();
    } else {
      this.snackBar.open('Invalid student ID', 'Close', { duration: 3000 });
      this.goBack();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChildProgress(): void {
    if (!this.studentId) return;

    this.loading = true;

    forkJoin({
      student: this.studentService.getStudentByUserId(this.studentId),
      attendanceSummary: this.attendanceService.getStudentAttendanceSummary(this.studentId),
      recentAttendance: this.attendanceService.getStudentAttendance(this.studentId),
      submissions: this.assessmentService.getSubmissionsByStudent(this.studentId, 0, 10)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.student = results.student;
          this.attendanceSummary = results.attendanceSummary;
          this.recentAttendance = results.recentAttendance.slice(0, 5); // Last 5 records
          
          const submissionsResponse: any = results.submissions;
          this.recentSubmissions = submissionsResponse.content || [];
          this.totalAssessments = submissionsResponse.totalElements || 0;
          
          // Calculate stats
          this.completedAssessments = this.recentSubmissions.filter(s => s.status === 'GRADED').length;
          const gradedSubmissions = this.recentSubmissions.filter(s => s.marksObtained !== null && s.marksObtained !== undefined);
          if (gradedSubmissions.length > 0) {
            const totalMarks = gradedSubmissions.reduce((sum, s) => sum + (s.marksObtained || 0), 0);
            this.averageGrade = parseFloat((totalMarks / gradedSubmissions.length).toFixed(2));
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading child progress:', error);
          this.snackBar.open('Failed to load child progress', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  getAttendanceRate(): number {
    if (!this.attendanceSummary) return 0;
    const total = this.attendanceSummary.totalDays || 0;
    const present = this.attendanceSummary.presentDays || 0;
    return total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
  }

  getAttendanceStatusClass(status: string): string {
    switch (status) {
      case 'PRESENT':
        return 'status-present';
      case 'ABSENT':
        return 'status-absent';
      case 'LATE':
        return 'status-late';
      case 'EXCUSED':
        return 'status-excused';
      default:
        return '';
    }
  }

  getSubmissionStatusClass(status: string): string {
    switch (status) {
      case 'GRADED':
        return 'status-graded';
      case 'SUBMITTED':
        return 'status-submitted';
      case 'PENDING':
        return 'status-pending';
      default:
        return '';
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  viewAllAttendance(): void {
    // TODO: Navigate to dedicated attendance view page
    this.snackBar.open('View All Attendance - Feature needed', 'Close', { duration: 3000 });
  }

  viewAllAssessments(): void {
    // TODO: Navigate to dedicated assessments/grades page
    this.snackBar.open('View All Assessments - Feature needed', 'Close', { duration: 3000 });
  }

  downloadReportCard(): void {
    // TODO: Generate and download report card PDF
    this.snackBar.open('Download Report Card - Feature needed', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/parent/children']);
  }
}
