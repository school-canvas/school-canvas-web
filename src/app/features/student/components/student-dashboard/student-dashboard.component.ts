import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { StudentService } from '../../../../core/services/api/student.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { selectUser } from '../../../auth/state/auth.selectors';
import { forkJoin, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    StatsCardComponent,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  studentProfile: any;
  upcomingClasses: any[] = [];
  recentGrades: any[] = [];
  attendanceRate = 0;
  currentUserId: string = '';
  
  // Stats
  totalClasses = 0;
  pendingAssignments = 0;
  averageGrade = 0;

  // Table configurations
  classColumns: TableColumn[] = [
    { key: 'className', label: 'Class', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'teacherName', label: 'Teacher', sortable: false },
    { key: 'schedule', label: 'Schedule', sortable: false }
  ];

  gradeColumns: TableColumn[] = [
    { key: 'title', label: 'Assessment', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'totalMarks', label: 'Total Marks', sortable: false },
    { key: 'dueDate', label: 'Due Date', sortable: true }
  ];

  classActions: TableAction[] = [
    {
      icon: 'info',
      label: 'View Details',
      handler: (row: any) => this.viewClassDetails(row)
    }
  ];

  constructor(
    private store: Store,
    private router: Router,
    private studentService: StudentService,
    private classService: ClassService,
    private assessmentService: AssessmentService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    // Use take(1) to auto-unsubscribe after first emission
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      console.log('[PERF] User from store:', user, new Date().toISOString());
      if (user?.id) {
        this.currentUserId = user.id;
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    console.log('[PERF] loadDashboardData started:', new Date().toISOString());
    this.loading = true;
    
    // Load student profile first
    this.studentService.getStudentByUserId(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: any) => {
          console.log('[PERF] Student profile loaded:', new Date().toISOString());
          this.studentProfile = profile;
          
          // Load all data in parallel using forkJoin for better performance
          forkJoin({
            classes: this.classService.getAllClasses(0, 5),
            grades: this.assessmentService.getAllAssessments(0, 5),
            attendance: this.attendanceService.getStudentAttendanceSummary(profile.id)
          }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
              console.log('[PERF] All dashboard data loaded:', new Date().toISOString());
              // Process classes
              this.upcomingClasses = results.classes.content || [];
              this.totalClasses = results.classes.totalElements || 0;
              
              // Process grades
              this.recentGrades = results.grades.content || [];
              this.pendingAssignments = this.recentGrades.filter((a: any) => !a.submitted).length;
              
              // Process attendance
              this.attendanceRate = results.attendance.attendancePercentage || 0;
              
              this.loading = false;
              console.log('[PERF] Dashboard rendering complete:', new Date().toISOString());
            },
            error: (error: any) => {
              console.error('Error loading dashboard data:', error);
              this.loading = false;
            }
          });
        },
        error: (error: any) => {
          console.error('Error loading student profile:', error);
          this.loading = false;
        }
      });
  }

  viewClassDetails(classItem: any): void {
    this.router.navigate(['/student/classes', classItem.id]);
  }

  onPageChange(event: any): void {
    console.log('Page changed:', event);
    // Handle pagination
  }

  onSortChange(event: any): void {
    console.log('Sort changed:', event);
    // Handle sorting
  }
}
