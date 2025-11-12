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

import { StudentService } from '../../../../core/services/api/student.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { selectUser } from '../../../auth/state/auth.selectors';

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
export class StudentDashboardComponent implements OnInit {
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
    private studentService: StudentService,
    private classService: ClassService,
    private assessmentService: AssessmentService,
    private attendanceService: AttendanceService
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
    
    // Load student profile using current user ID
    this.studentService.getStudentByUserId(this.currentUserId).subscribe({
      next: (profile: any) => {
        this.studentProfile = profile;
        this.loadClasses();
        this.loadGrades();
        this.loadAttendance();
      },
      error: (error: any) => {
        console.error('Error loading student profile:', error);
        this.loading = false;
      }
    });
  }

  loadClasses(): void {
    this.classService.getAllClasses(0, 5).subscribe({
      next: (response: any) => {
        this.upcomingClasses = response.content || [];
        this.totalClasses = response.totalElements || 0;
      },
      error: (error: any) => console.error('Error loading classes:', error)
    });
  }

  loadGrades(): void {
    this.assessmentService.getAllAssessments(0, 5).subscribe({
      next: (response: any) => {
        this.recentGrades = response.content || [];
        this.pendingAssignments = this.recentGrades.filter((a: any) => !a.submitted).length;
      },
      error: (error: any) => console.error('Error loading grades:', error)
    });
  }

  loadAttendance(): void {
    if (this.studentProfile?.id) {
      this.attendanceService.getStudentAttendanceSummary(this.studentProfile.id).subscribe({
        next: (summary: any) => {
          this.attendanceRate = summary.attendancePercentage || 0;
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

  viewClassDetails(classItem: any): void {
    console.log('View class details:', classItem);
    // Navigate to class details
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
