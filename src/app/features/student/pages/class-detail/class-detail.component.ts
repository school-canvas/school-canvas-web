import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { ClassService } from '../../../../core/services/api/class.service';
import { TeacherService } from '../../../../core/services/api/teacher.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent
  ],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.css'
})
export class ClassDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  classId: string = '';
  classDetails: any;
  teacherDetails: any;
  classStudents: any[] = [];
  upcomingAssessments: any[] = [];
  
  // Table configurations
  studentColumns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'enrollmentDate', label: 'Enrolled', sortable: true }
  ];

  assessmentColumns: TableColumn[] = [
    { key: 'title', label: 'Assessment', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'totalMarks', label: 'Total Marks', sortable: false },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' }
  ];

  assessmentActions: TableAction[] = [
    {
      icon: 'assignment',
      label: 'View Assessment',
      handler: (row: any) => this.viewAssessment(row)
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.classId = params['id'];
      if (this.classId) {
        this.loadClassDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClassDetails(): void {
    this.loading = true;
    
    // Load class details
    this.classService.getClassById(this.classId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classData: any) => {
          this.classDetails = {
            ...classData,
            className: classData.name || classData.className || 'N/A',
            description: classData.description || 'No description available',
            schedule: classData.schedule || 'Not Set',
            room: classData.room || 'TBA',
            semester: classData.semester || 'Spring 2025',
            credits: classData.credits || 3,
            status: classData.status || 'active'
          };
          
          // Load related data in parallel
          forkJoin({
            students: this.studentService.getAllStudents(0, 20),
            assessments: this.assessmentService.getAllAssessments(0, 10)
          }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
              // Process students
              this.classStudents = (results.students.content || []).slice(0, 10);
              
              // Process assessments
              this.upcomingAssessments = (results.assessments.content || [])
                .map((assessment: any) => ({
                  ...assessment,
                  status: assessment.submitted ? 'completed' : 'pending'
                }));
              
              // Mock teacher details for now
              this.teacherDetails = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@school.com',
                department: 'Mathematics'
              };
              
              this.loading = false;
            },
            error: (error: any) => {
              console.error('Error loading class data:', error);
              this.loading = false;
            }
          });
        },
        error: (error: any) => {
          console.error('Error loading class details:', error);
          this.loading = false;
        }
      });
  }

  viewAssessment(assessment: any): void {
    this.router.navigate(['/student/assessments', assessment.id]);
  }

  contactTeacher(): void {
    console.log('Contact teacher:', this.teacherDetails);
    // TODO: Navigate to communication page
  }

  viewAllStudents(): void {
    console.log('View all students in class');
    // TODO: Navigate to full student list
  }

  viewAllAssessments(): void {
    this.router.navigate(['/student/assessments'], {
      queryParams: { classId: this.classId }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/classes']);
  }
}
