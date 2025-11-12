import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { selectUser } from '../../../auth/state/auth.selectors';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-assessments',
  standalone: true,
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
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent
  ],
  templateUrl: './my-assessments.component.html',
  styleUrl: './my-assessments.component.css'
})
export class MyAssessmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  currentUserId: string = '';
  studentProfile: any;
  
  // Assessments data
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  totalAssessments = 0;
  
  // Filters
  searchTerm = '';
  selectedType = 'all';
  selectedStatus = 'all';
  selectedClass = 'all';
  
  // Filter options
  types = [
    { value: 'all', label: 'All Types' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'exam', label: 'Exam' },
    { value: 'homework', label: 'Homework' },
    { value: 'project', label: 'Project' },
    { value: 'assignment', label: 'Assignment' }
  ];
  
  statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'graded', label: 'Graded' },
    { value: 'overdue', label: 'Overdue' }
  ];
  
  classes: any[] = [
    { value: 'all', label: 'All Classes' }
  ];
  
  // Statistics
  pendingCount = 0;
  submittedCount = 0;
  gradedCount = 0;
  overdueCount = 0;
  
  // Table configuration
  columns: TableColumn[] = [
    { key: 'title', label: 'Assessment', sortable: true },
    { key: 'type', label: 'Type', sortable: true, type: 'badge' },
    { key: 'className', label: 'Class', sortable: true },
    { key: 'totalMarks', label: 'Total Marks', sortable: false },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' },
    { key: 'grade', label: 'Grade', sortable: false }
  ];

  actions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewAssessmentDetails(row)
    },
    {
      icon: 'upload',
      label: 'Submit',
      handler: (row: any) => this.submitAssessment(row),
      color: 'primary'
    },
    {
      icon: 'feedback',
      label: 'View Feedback',
      handler: (row: any) => this.viewFeedback(row),
      color: 'accent'
    }
  ];

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private assessmentService: AssessmentService,
    private studentService: StudentService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      if (user?.id) {
        this.currentUserId = user.id;
        
        // Check for classId query param
        this.route.queryParams.pipe(take(1)).subscribe(params => {
          if (params['classId']) {
            this.selectedClass = params['classId'];
          }
          this.loadAssessments();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssessments(): void {
    this.loading = true;
    
    // Load student profile first
    this.studentService.getStudentByUserId(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: any) => {
          this.studentProfile = profile;
          
          // Load assessments
          this.assessmentService.getAllAssessments(0, 100)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                // Process assessments
                this.assessments = (response.content || []).map((assessment: any) => {
                  const dueDate = new Date(assessment.dueDate);
                  const now = new Date();
                  const isOverdue = dueDate < now && assessment.status !== 'graded' && assessment.status !== 'submitted';
                  
                  return {
                    ...assessment,
                    className: assessment.className || 'General',
                    type: assessment.type || 'assignment',
                    status: isOverdue ? 'overdue' : (assessment.status || 'pending'),
                    grade: assessment.marksObtained ? `${assessment.marksObtained}/${assessment.totalMarks}` : '-',
                    isOverdue: isOverdue
                  };
                });
                
                this.totalAssessments = this.assessments.length;
                this.calculateStatistics();
                this.loadClasses();
                this.applyFilters();
                this.loading = false;
              },
              error: (error: any) => {
                console.error('Error loading assessments:', error);
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

  loadClasses(): void {
    this.classService.getAllClasses(0, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const classList = (response.content || []).map((cls: any) => ({
            value: cls.id,
            label: cls.name || cls.className || 'N/A'
          }));
          this.classes = [{ value: 'all', label: 'All Classes' }, ...classList];
        },
        error: (error: any) => {
          console.error('Error loading classes:', error);
        }
      });
  }

  calculateStatistics(): void {
    this.pendingCount = this.assessments.filter(a => a.status === 'pending').length;
    this.submittedCount = this.assessments.filter(a => a.status === 'submitted').length;
    this.gradedCount = this.assessments.filter(a => a.status === 'graded').length;
    this.overdueCount = this.assessments.filter(a => a.status === 'overdue').length;
  }

  applyFilters(): void {
    this.filteredAssessments = this.assessments.filter(assessment => {
      const matchesSearch = !this.searchTerm || 
        assessment.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        assessment.className.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = this.selectedType === 'all' || 
        assessment.type === this.selectedType;
      
      const matchesStatus = this.selectedStatus === 'all' || 
        assessment.status === this.selectedStatus;
      
      const matchesClass = this.selectedClass === 'all' || 
        assessment.classId === this.selectedClass;
      
      return matchesSearch && matchesType && matchesStatus && matchesClass;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onClassChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'all';
    this.selectedStatus = 'all';
    this.selectedClass = 'all';
    this.applyFilters();
  }

  getTypeLabel(value: string): string {
    const type = this.types.find(t => t.value === value);
    return type ? type.label : value;
  }

  getStatusLabel(value: string): string {
    const status = this.statuses.find(s => s.value === value);
    return status ? status.label : value;
  }

  getClassLabel(value: string): string {
    const cls = this.classes.find(c => c.value === value);
    return cls ? cls.label : value;
  }

  viewAssessmentDetails(assessment: any): void {
    console.log('View assessment details:', assessment);
    // TODO: Navigate to assessment detail page or open dialog
  }

  submitAssessment(assessment: any): void {
    console.log('Submit assessment:', assessment);
    // TODO: Open submission dialog
  }

  viewFeedback(assessment: any): void {
    console.log('View feedback:', assessment);
    // TODO: Open feedback dialog or navigate to feedback page
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
