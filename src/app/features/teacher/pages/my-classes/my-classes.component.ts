import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { takeUntil, take, debounceTime } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ClassService } from '../../../../core/services/api/class.service';
import { TeacherService } from '../../../../core/services/api/teacher.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { selectUser } from '../../../auth/state/auth.selectors';

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  subject: string;
  gradeLevel: string;
  semester: string;
  academicYear: string;
  schedule: string;
  room: string;
  totalStudents: number;
  activeStudents: number;
  averageAttendance: number;
  pendingAssignments: number;
  gradedAssignments: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
}

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  pendingGrading: number;
}

@Component({
  selector: 'app-my-classes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    PageHeaderComponent,
    StatsCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './my-classes.component.html',
  styleUrl: './my-classes.component.css'
})
export class MyClassesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  teacherId: string = '';
  
  // Search and filters
  searchControl = new FormControl('');
  semesterFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // Data
  allClasses: ClassInfo[] = [];
  filteredClasses: ClassInfo[] = [];
  
  semesters = ['all', 'Semester 1', 'Semester 2'];
  statuses = ['all', 'ACTIVE', 'COMPLETED', 'UPCOMING'];
  
  stats: TeacherStats = {
    totalClasses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    pendingGrading: 0
  };

  constructor(
    private classService: ClassService,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(take(1))
      .subscribe(user => {
        if (user?.id) {
          this.teacherId = user.id;
          this.loadClassData();
        }
      });

    // Search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    // Filter subscriptions
    this.semesterFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClassData(): void {
    this.loading = true;

    // Mock class data - replace with actual API calls
    setTimeout(() => {
      this.allClasses = this.generateMockClasses();
      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  generateMockClasses(): ClassInfo[] {
    const classes: ClassInfo[] = [];
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry'];
    const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
    const sections = ['A', 'B', 'C'];

    for (let i = 1; i <= 6; i++) {
      const subject = subjects[i - 1];
      const grade = grades[i % grades.length];
      const section = sections[i % sections.length];
      
      classes.push({
        id: `class-${i}`,
        name: `${grade} ${subject}`,
        section: section,
        subject: subject,
        gradeLevel: grade,
        semester: i % 2 === 0 ? 'Semester 2' : 'Semester 1',
        academicYear: '2024-2025',
        schedule: ['Mon/Wed/Fri 9:00 AM', 'Tue/Thu 10:30 AM', 'Mon/Wed 2:00 PM'][i % 3],
        room: `Room ${100 + i}`,
        totalStudents: 25 + (i * 3),
        activeStudents: 23 + (i * 3),
        averageAttendance: 85 + (i % 10),
        pendingAssignments: Math.floor(Math.random() * 8) + 2,
        gradedAssignments: Math.floor(Math.random() * 15) + 10,
        status: i <= 4 ? 'ACTIVE' : i === 5 ? 'UPCOMING' : 'COMPLETED'
      });
    }

    return classes;
  }

  calculateStats(): void {
    const totalClasses = this.allClasses.length;
    const totalStudents = this.allClasses.reduce((sum, cls) => sum + cls.totalStudents, 0);
    const averageAttendance = this.allClasses.reduce((sum, cls) => sum + cls.averageAttendance, 0) / totalClasses;
    const pendingGrading = this.allClasses.reduce((sum, cls) => sum + cls.pendingAssignments, 0);

    this.stats = {
      totalClasses,
      totalStudents,
      averageAttendance: Math.round(averageAttendance),
      pendingGrading
    };
  }

  applyFilters(): void {
    let filtered = [...this.allClasses];

    // Search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm) ||
        cls.subject.toLowerCase().includes(searchTerm) ||
        cls.section.toLowerCase().includes(searchTerm)
      );
    }

    // Semester filter
    const semester = this.semesterFilter.value;
    if (semester && semester !== 'all') {
      filtered = filtered.filter(cls => cls.semester === semester);
    }

    // Status filter
    const status = this.statusFilter.value;
    if (status && status !== 'all') {
      filtered = filtered.filter(cls => cls.status === status);
    }

    this.filteredClasses = filtered;
  }

  viewClassDetails(classInfo: ClassInfo): void {
    this.router.navigate(['/teacher/classes', classInfo.id]);
  }

  takeAttendance(classInfo: ClassInfo): void {
    this.router.navigate(['/teacher/attendance', classInfo.id]);
  }

  manageGrades(classInfo: ClassInfo): void {
    this.router.navigate(['/teacher/gradebook', classInfo.id]);
  }

  viewStudents(classInfo: ClassInfo): void {
    this.router.navigate(['/teacher/classes', classInfo.id, 'students']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'status-active',
      'COMPLETED': 'status-completed',
      'UPCOMING': 'status-upcoming'
    };
    return statusMap[status] || '';
  }

  getAttendanceColor(attendance: number): 'success' | 'warning' | 'error' {
    if (attendance >= 90) return 'success';
    if (attendance >= 75) return 'warning';
    return 'error';
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.semesterFilter.setValue('all');
    this.statusFilter.setValue('all');
  }
}
