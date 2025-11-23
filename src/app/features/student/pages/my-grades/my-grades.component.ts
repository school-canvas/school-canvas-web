import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { ChartComponent, ChartData } from '../../../../shared/components/chart/chart.component';

import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { selectUser } from '../../../auth/state/auth.selectors';
import { Subject, forkJoin } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

interface GradeData {
  classId: string;
  className: string;
  grade: string;
  percentage: number;
  credits: number;
  letterGrade: string;
  gradePoint: number;
}

@Component({
  selector: 'app-my-grades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatsCardComponent
  ],
  templateUrl: './my-grades.component.html',
  styleUrl: './my-grades.component.css'
})
export class MyGradesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  currentUserId: string = '';
  studentProfile: any;
  
  // Semester selection
  selectedSemester = 'spring-2025';
  semesters = [
    { value: 'spring-2025', label: 'Spring 2025' },
    { value: 'fall-2024', label: 'Fall 2024' },
    { value: 'summer-2024', label: 'Summer 2024' },
    { value: 'spring-2024', label: 'Spring 2024' }
  ];
  
  // Grades data
  grades: GradeData[] = [];
  
  // Statistics
  currentGPA = 0;
  totalCredits = 0;
  averagePercentage = 0;
  classesCompleted = 0;
  
  // Chart data
  gradeDistributionChart!: ChartData;
  performanceTrendChart!: ChartData;
  
  // Table columns
  displayedColumns: string[] = ['className', 'percentage', 'letterGrade', 'credits', 'gradePoint'];

  constructor(
    private store: Store,
    private router: Router,
    private assessmentService: AssessmentService,
    private studentService: StudentService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      if (user?.id) {
        this.currentUserId = user.id;
        this.loadGrades();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGrades(): void {
    this.loading = true;
    
    // Load student profile
    this.studentService.getStudentByUserId(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: any) => {
          this.studentProfile = profile;
          
          // Load classes and assessments
          forkJoin({
            classes: this.classService.getAllClasses(0, 50),
            assessments: this.assessmentService.getAllAssessments(0, 100)
          }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
              this.processGrades(results.classes.content || [], results.assessments.content || []);
              this.loading = false;
            },
            error: (error: any) => {
              console.error('Error loading grades:', error);
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

  processGrades(classes: any[], assessments: any[]): void {
    // Group assessments by class
    const assessmentsByClass = new Map<string, any[]>();
    
    assessments.forEach(assessment => {
      const classId = assessment.classId || 'general';
      if (!assessmentsByClass.has(classId)) {
        assessmentsByClass.set(classId, []);
      }
      if (assessment.marksObtained !== undefined && assessment.status === 'graded') {
        assessmentsByClass.get(classId)!.push(assessment);
      }
    });
    
    // Calculate grades for each class
    this.grades = classes.map((cls: any) => {
      const classAssessments = assessmentsByClass.get(cls.id) || [];
      
      // Calculate average percentage
      let totalPercentage = 0;
      let count = 0;
      
      classAssessments.forEach(assessment => {
        if (assessment.totalMarks > 0) {
          const percentage = (assessment.marksObtained / assessment.totalMarks) * 100;
          totalPercentage += percentage;
          count++;
        }
      });
      
      const avgPercentage = count > 0 ? totalPercentage / count : 0;
      const letterGrade = this.getLetterGrade(avgPercentage);
      const gradePoint = this.getGradePoint(letterGrade);
      const credits = cls.credits || 3;
      
      return {
        classId: cls.id,
        className: cls.name || cls.className || 'N/A',
        grade: count > 0 ? `${avgPercentage.toFixed(1)}%` : 'N/A',
        percentage: avgPercentage,
        credits: credits,
        letterGrade: letterGrade,
        gradePoint: gradePoint
      };
    }).filter(grade => grade.percentage > 0); // Only show classes with grades
    
    this.calculateStatistics();
  }

  calculateStatistics(): void {
    if (this.grades.length === 0) {
      this.currentGPA = 0;
      this.totalCredits = 0;
      this.averagePercentage = 0;
      this.classesCompleted = 0;
      return;
    }
    
    // Calculate GPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    let totalPercentage = 0;
    
    this.grades.forEach(grade => {
      totalGradePoints += grade.gradePoint * grade.credits;
      totalCredits += grade.credits;
      totalPercentage += grade.percentage;
    });
    
    this.currentGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    this.totalCredits = totalCredits;
    this.averagePercentage = this.grades.length > 0 ? totalPercentage / this.grades.length : 0;
    this.classesCompleted = this.grades.length;
    
    this.generateCharts();
  }

  generateCharts(): void {
    // Grade Distribution Bar Chart
    this.gradeDistributionChart = {
      labels: this.grades.map(g => g.className),
      datasets: [{
        label: 'Grade (%)',
        data: this.grades.map(g => g.percentage),
        backgroundColor: this.grades.map(g => this.getGradeColor(g.percentage)),
        borderWidth: 0
      }]
    };

    // Performance Trend - GPA over semesters (mock data for now)
    this.performanceTrendChart = {
      labels: ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Spring 2025'],
      datasets: [{
        label: 'GPA',
        data: [3.2, 3.4, 3.5, this.currentGPA],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  getGradeColor(input: number | string): string {
    if (typeof input === 'number') {
      // Color based on percentage
      if (input >= 90) return '#4caf50'; // Green - A
      if (input >= 80) return '#8bc34a'; // Light green - B
      if (input >= 70) return '#ffc107'; // Yellow - C
      if (input >= 60) return '#ff9800'; // Orange - D
      return '#f44336'; // Red - F
    } else {
      // CSS class based on letter grade
      if (input.startsWith('A')) return 'grade-a';
      if (input.startsWith('B')) return 'grade-b';
      if (input.startsWith('C')) return 'grade-c';
      if (input.startsWith('D')) return 'grade-d';
      return 'grade-f';
    }
  }

  getLetterGrade(percentage: number): string {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }

  getGradePoint(letterGrade: string): number {
    const gradePoints: { [key: string]: number } = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    return gradePoints[letterGrade] || 0.0;
  }

  onSemesterChange(): void {
    // In a real app, you would reload grades for the selected semester
    console.log('Semester changed to:', this.selectedSemester);
  }

  printReportCard(): void {
    window.print();
  }

  downloadReportCard(): void {
    console.log('Download report card');
    // TODO: Implement PDF generation
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
