import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { TeacherService } from '../../../../core/services/api/teacher.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { selectUser } from '../../../auth/state/auth.selectors';

@Component({
  selector: 'app-teacher-dashboard',
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
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {
  loading = true;
  teacherProfile: any;
  myClasses: any[] = [];
  recentAssessments: any[] = [];
  todayAttendance: any[] = [];
  currentUserId: string = '';
  
  // Stats
  totalClasses = 0;
  totalStudents = 0;
  pendingGrading = 0;
  attendanceRate = 0;

  // Table configurations
  classColumns: TableColumn[] = [
    { key: 'className', label: 'Class', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'studentCount', label: 'Students', sortable: true },
    { key: 'schedule', label: 'Schedule', sortable: false }
  ];

  assessmentColumns: TableColumn[] = [
    { key: 'title', label: 'Assessment', sortable: true },
    { key: 'className', label: 'Class', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'submissions', label: 'Submissions', sortable: false }
  ];

  classActions: TableAction[] = [
    {
      icon: 'people',
      label: 'View Students',
      handler: (row: any) => this.viewClassStudents(row)
    },
    {
      icon: 'assignment',
      label: 'Take Attendance',
      handler: (row: any) => this.takeAttendance(row),
      color: 'accent'
    }
  ];

  assessmentActions: TableAction[] = [
    {
      icon: 'grading',
      label: 'Grade Submissions',
      handler: (row: any) => this.gradeAssessment(row),
      color: 'primary'
    }
  ];

  constructor(
    private store: Store,
    private teacherService: TeacherService,
    private classService: ClassService,
    private attendanceService: AttendanceService,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    // Get current user from store
    this.store.select(selectUser).subscribe(user => {
      if (user?.id) {
        this.currentUserId = user.id;
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load teacher profile
    this.teacherService.getTeacherByUserId(this.currentUserId).subscribe({
      next: (profile: any) => {
        this.teacherProfile = profile;
        this.loadClasses();
        this.loadAssessments();
        this.loadAttendance();
      },
      error: (error: any) => {
        console.error('Error loading teacher profile:', error);
        this.loading = false;
      }
    });
  }

  loadClasses(): void {
    if (this.teacherProfile?.id) {
      this.classService.getAllClasses(0, 10).subscribe({
        next: (response: any) => {
          this.myClasses = response.content || [];
          this.totalClasses = response.totalElements || 0;
          // Calculate total students across all classes
          this.totalStudents = this.myClasses.reduce((sum: number, cls: any) => 
            sum + (cls.studentCount || 0), 0);
        },
        error: (error: any) => console.error('Error loading classes:', error)
      });
    }
  }

  loadAssessments(): void {
    this.assessmentService.getAllAssessments(0, 5).subscribe({
      next: (response: any) => {
        this.recentAssessments = response.content || [];
        // Count pending grading (assessments with submissions but no grades)
        this.pendingGrading = this.recentAssessments.filter((a: any) => 
          a.submissionCount > 0 && a.gradedCount < a.submissionCount
        ).length;
      },
      error: (error: any) => console.error('Error loading assessments:', error)
    });
  }

  loadAttendance(): void {
    if (this.teacherProfile?.id) {
      // Get teacher's attendance summary
      const today = new Date().toISOString().split('T')[0];
      this.attendanceService.getTeacherAttendance(this.teacherProfile.id, today, today).subscribe({
        next: (records: any) => {
          this.todayAttendance = records || [];
          // Calculate attendance rate for today
          if (this.todayAttendance.length > 0) {
            const present = this.todayAttendance.filter((r: any) => 
              r.status === 'PRESENT'
            ).length;
            this.attendanceRate = Math.round((present / this.todayAttendance.length) * 100);
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading attendance:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  viewClassStudents(classItem: any): void {
    console.log('View class students:', classItem);
    // Navigate to class students view
  }

  takeAttendance(classItem: any): void {
    console.log('Take attendance for class:', classItem);
    // Navigate to attendance marking view
  }

  gradeAssessment(assessment: any): void {
    console.log('Grade assessment:', assessment);
    // Navigate to grading view
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
