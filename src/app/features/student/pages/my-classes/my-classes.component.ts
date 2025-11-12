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
import { Store } from '@ngrx/store';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { ClassService } from '../../../../core/services/api/class.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { selectUser } from '../../../auth/state/auth.selectors';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-classes',
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
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent
  ],
  templateUrl: './my-classes.component.html',
  styleUrl: './my-classes.component.css'
})
export class MyClassesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  currentUserId: string = '';
  studentProfile: any;
  
  // Classes data
  classes: any[] = [];
  filteredClasses: any[] = [];
  totalClasses = 0;
  
  // Filters
  searchTerm = '';
  selectedSemester = 'all';
  selectedStatus = 'all';
  
  semesters = [
    { value: 'all', label: 'All Semesters' },
    { value: 'spring-2025', label: 'Spring 2025' },
    { value: 'fall-2024', label: 'Fall 2024' },
    { value: 'summer-2024', label: 'Summer 2024' }
  ];
  
  statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'upcoming', label: 'Upcoming' }
  ];
  
  // Table configuration
  columns: TableColumn[] = [
    { key: 'className', label: 'Class Name', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'teacherName', label: 'Teacher', sortable: false },
    { key: 'schedule', label: 'Schedule', sortable: false },
    { key: 'semester', label: 'Semester', sortable: true },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' }
  ];

  actions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewClassDetails(row)
    },
    {
      icon: 'assignment',
      label: 'View Assignments',
      handler: (row: any) => this.viewAssignments(row)
    }
  ];

  constructor(
    private store: Store,
    private router: Router,
    private classService: ClassService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      if (user?.id) {
        this.currentUserId = user.id;
        this.loadStudentClasses();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudentClasses(): void {
    this.loading = true;
    
    // First get student profile
    this.studentService.getStudentByUserId(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: any) => {
          this.studentProfile = profile;
          
          // Then get classes
          this.classService.getAllClasses(0, 50)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                this.classes = (response.content || []).map((cls: any) => ({
                  ...cls,
                  className: cls.name || cls.className || 'N/A',
                  teacherName: cls.teacherName || 'TBA',
                  schedule: cls.schedule || 'Not Set',
                  semester: cls.semester || 'Spring 2025',
                  status: cls.status || 'active'
                }));
                this.totalClasses = this.classes.length;
                this.applyFilters();
                this.loading = false;
              },
              error: (error: any) => {
                console.error('Error loading classes:', error);
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

  applyFilters(): void {
    this.filteredClasses = this.classes.filter(cls => {
      const matchesSearch = !this.searchTerm || 
        cls.className.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cls.teacherName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesSemester = this.selectedSemester === 'all' || 
        cls.semester === this.selectedSemester;
      
      const matchesStatus = this.selectedStatus === 'all' || 
        cls.status === this.selectedStatus;
      
      return matchesSearch && matchesSemester && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSemesterChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSemester = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  getSemesterLabel(value: string): string {
    const semester = this.semesters.find(s => s.value === value);
    return semester ? semester.label : value;
  }

  getStatusLabel(value: string): string {
    const status = this.statuses.find(s => s.value === value);
    return status ? status.label : value;
  }

  viewClassDetails(classItem: any): void {
    this.router.navigate(['/student/classes', classItem.id]);
  }

  viewAssignments(classItem: any): void {
    this.router.navigate(['/student/assessments'], { 
      queryParams: { classId: classItem.id } 
    });
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
