import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { StudentService } from '../../../../core/services/api/student.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { ClassService } from '../../../../core/services/api/class.service';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  grade: string;
  section: string;
  profileImage?: string;
}

interface SubjectGrade {
  subject: string;
  currentGrade: number;
  letterGrade: string;
  gradePoints: number;
  trend: 'up' | 'down' | 'stable';
  assignments: number;
  completed: number;
  avgScore: number;
}

interface GradeTrend {
  month: string;
  gpa: number;
  attendance: number;
}

interface AttendanceRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

interface BehaviorNote {
  id: string;
  date: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  category: string;
  note: string;
  teacher: string;
}

interface Assignment {
  title: string;
  subject: string;
  type: string;
  dueDate: string;
  status: 'SUBMITTED' | 'PENDING' | 'LATE' | 'GRADED';
  score?: number;
  maxScore: number;
  grade?: string;
}

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    BaseChartDirective,
    PageHeaderComponent,
    StatsCardComponent
  ],
  templateUrl: './student-progress.component.html',
  styleUrl: './student-progress.component.css'
})
export class StudentProgressComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  private destroy$ = new Subject<void>();
  
  loading = true;
  students: StudentInfo[] = [];
  selectedStudentId: string = '';
  selectedStudent: StudentInfo | null = null;
  
  // Academic data
  subjectGrades: SubjectGrade[] = [];
  gradeTrends: GradeTrend[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  behaviorNotes: BehaviorNote[] = [];
  recentAssignments: Assignment[] = [];
  
  // Performance metrics
  currentGPA = 0;
  attendanceRate = 0;
  assignmentsCompleted = 0;
  totalAssignments = 0;
  
  // Chart configurations
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4.0,
        ticks: {
          stepSize: 0.5
        }
      }
    }
  };
  
  public lineChartType: ChartType = 'line' as const;
  
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };
  
  public barChartType: ChartType = 'bar' as const;
  
  // Table columns
  assignmentColumns = ['title', 'type', 'dueDate', 'status', 'score'];
  behaviorColumns = ['date', 'type', 'category', 'note', 'teacher'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private studentService: StudentService,
    private assessmentService: AssessmentService,
    private attendanceService: AttendanceService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    
    // Check if student ID is in route params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['studentId']) {
        this.selectedStudentId = params['studentId'];
        this.onStudentChange();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.loading = true;
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.students = this.generateMockStudents();
      
      if (this.students.length > 0 && !this.selectedStudentId) {
        this.selectedStudentId = this.students[0].id;
        this.onStudentChange();
      }
      
      this.loading = false;
    }, 500);
  }

  generateMockStudents(): StudentInfo[] {
    const students: StudentInfo[] = [];
    const firstNames = ['John', 'Emily', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia', 
                        'William', 'Isabella', 'Daniel', 'Ava', 'Matthew', 'Mia', 'Christopher', 'Charlotte', 'Andrew', 'Amelia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    for (let i = 0; i < 25; i++) {
      students.push({
        id: `student-${i + 1}`,
        firstName: firstNames[i % firstNames.length],
        lastName: lastNames[i % lastNames.length],
        rollNumber: `STU${String(i + 1).padStart(3, '0')}`,
        grade: '10',
        section: 'A'
      });
    }
    
    return students.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  }

  onStudentChange(): void {
    if (!this.selectedStudentId) return;
    
    this.loading = true;
    this.selectedStudent = this.students.find(s => s.id === this.selectedStudentId) || null;
    
    // Load student data
    setTimeout(() => {
      this.loadStudentData();
      this.loading = false;
    }, 500);
  }

  loadStudentData(): void {
    this.subjectGrades = this.generateMockSubjectGrades();
    this.gradeTrends = this.generateMockGradeTrends();
    this.attendanceRecords = this.generateMockAttendance();
    this.behaviorNotes = this.generateMockBehaviorNotes();
    this.recentAssignments = this.generateMockAssignments();
    
    this.calculateMetrics();
    this.updateCharts();
  }

  generateMockSubjectGrades(): SubjectGrade[] {
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Physical Education'];
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    
    return subjects.map(subject => {
      const avgScore = 70 + Math.random() * 25;
      const completed = 8 + Math.floor(Math.random() * 7);
      const total = 15;
      
      return {
        subject,
        currentGrade: avgScore,
        letterGrade: this.getLetterGrade(avgScore),
        gradePoints: this.getGradePoints(avgScore),
        trend: trends[Math.floor(Math.random() * trends.length)],
        assignments: total,
        completed,
        avgScore
      };
    });
  }

  generateMockGradeTrends(): GradeTrend[] {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const trends: GradeTrend[] = [];
    
    let gpa = 3.0 + Math.random() * 0.5;
    let attendance = 85 + Math.random() * 10;
    
    for (const month of months) {
      trends.push({
        month,
        gpa: Number(gpa.toFixed(2)),
        attendance: Number(attendance.toFixed(1))
      });
      
      // Slight variations
      gpa += (Math.random() - 0.5) * 0.3;
      gpa = Math.max(2.5, Math.min(4.0, gpa));
      
      attendance += (Math.random() - 0.5) * 5;
      attendance = Math.max(75, Math.min(100, attendance));
    }
    
    return trends;
  }

  generateMockAttendance(): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const statuses: ('PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED')[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    const weights = [0.9, 0.05, 0.03, 0.02]; // 90% present, 5% absent, etc.
    
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const rand = Math.random();
      let cumWeight = 0;
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' = 'PRESENT';
      
      for (let j = 0; j < weights.length; j++) {
        cumWeight += weights[j];
        if (rand <= cumWeight) {
          status = statuses[j];
          break;
        }
      }
      
      records.push({
        date: date.toISOString().split('T')[0],
        status
      });
    }
    
    return records;
  }

  generateMockBehaviorNotes(): BehaviorNote[] {
    const types: ('POSITIVE' | 'NEGATIVE' | 'NEUTRAL')[] = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
    const categories = ['Participation', 'Homework', 'Behavior', 'Leadership', 'Teamwork', 'Attendance'];
    const notes: BehaviorNote[] = [];
    
    for (let i = 0; i < 8; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      
      let note = '';
      if (type === 'POSITIVE') {
        note = 'Excellent work on class presentation. Showed great understanding of the topic.';
      } else if (type === 'NEGATIVE') {
        note = 'Missed homework submission. Needs to improve time management.';
      } else {
        note = 'Average performance. Needs more participation in class discussions.';
      }
      
      notes.push({
        id: `note-${i + 1}`,
        date: date.toISOString().split('T')[0],
        type,
        category: categories[Math.floor(Math.random() * categories.length)],
        note,
        teacher: 'Mr. Anderson'
      });
    }
    
    return notes;
  }

  generateMockAssignments(): Assignment[] {
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
    const types = ['Homework', 'Quiz', 'Exam', 'Project'];
    const statuses: ('SUBMITTED' | 'PENDING' | 'LATE' | 'GRADED')[] = ['SUBMITTED', 'PENDING', 'LATE', 'GRADED'];
    const assignments: Assignment[] = [];
    
    for (let i = 0; i < 10; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - (10 - i) * 3);
      
      const maxScore = 100;
      const score = status === 'GRADED' ? 70 + Math.random() * 25 : undefined;
      
      assignments.push({
        title: `${types[i % types.length]} ${Math.floor(i / 4) + 1}`,
        subject: subjects[i % subjects.length],
        type: types[i % types.length],
        dueDate: dueDate.toISOString().split('T')[0],
        status,
        score: score ? Number(score.toFixed(0)) : undefined,
        maxScore,
        grade: score ? this.getLetterGrade(score) : undefined
      });
    }
    
    return assignments;
  }

  calculateMetrics(): void {
    // Calculate GPA
    if (this.subjectGrades.length > 0) {
      const totalPoints = this.subjectGrades.reduce((sum, subject) => sum + subject.gradePoints, 0);
      this.currentGPA = Number((totalPoints / this.subjectGrades.length).toFixed(2));
    }
    
    // Calculate attendance rate
    if (this.attendanceRecords.length > 0) {
      const presentCount = this.attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      this.attendanceRate = Number(((presentCount / this.attendanceRecords.length) * 100).toFixed(1));
    }
    
    // Calculate assignments
    this.totalAssignments = this.recentAssignments.length;
    this.assignmentsCompleted = this.recentAssignments.filter(a => a.status === 'GRADED' || a.status === 'SUBMITTED').length;
  }

  updateCharts(): void {
    // Update line chart (GPA and Attendance Trends)
    this.lineChartData = {
      labels: this.gradeTrends.map(t => t.month),
      datasets: [
        {
          data: this.gradeTrends.map(t => t.gpa),
          label: 'GPA',
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          data: this.gradeTrends.map(t => t.attendance / 25), // Scale to match GPA scale
          label: 'Attendance (scaled)',
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    // Update bar chart (Subject Performance)
    this.barChartData = {
      labels: this.subjectGrades.map(s => s.subject),
      datasets: [
        {
          data: this.subjectGrades.map(s => s.avgScore),
          label: 'Average Score',
          backgroundColor: this.subjectGrades.map(s => this.getBarColor(s.avgScore)),
          borderColor: this.subjectGrades.map(s => this.getBarColor(s.avgScore)),
          borderWidth: 1
        }
      ]
    };
    
    this.chart?.update();
  }

  getBarColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#8bc34a';
    if (score >= 70) return '#ffc107';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }

  getLetterGrade(score: number): string {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 63) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  }

  getGradePoints(score: number): number {
    if (score >= 97) return 4.0;
    if (score >= 93) return 4.0;
    if (score >= 90) return 3.7;
    if (score >= 87) return 3.3;
    if (score >= 83) return 3.0;
    if (score >= 80) return 2.7;
    if (score >= 77) return 2.3;
    if (score >= 73) return 2.0;
    if (score >= 70) return 1.7;
    if (score >= 67) return 1.3;
    if (score >= 63) return 1.0;
    if (score >= 60) return 0.7;
    return 0.0;
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    return trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';
  }

  getTrendClass(trend: 'up' | 'down' | 'stable'): string {
    return trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-stable';
  }

  getBehaviorClass(type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'): string {
    return type === 'POSITIVE' ? 'behavior-positive' : type === 'NEGATIVE' ? 'behavior-negative' : 'behavior-neutral';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'GRADED': 'status-graded',
      'SUBMITTED': 'status-submitted',
      'PENDING': 'status-pending',
      'LATE': 'status-late'
    };
    return statusMap[status] || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  printReport(): void {
    window.print();
  }

  exportReport(): void {
    // Placeholder for export functionality
    alert('Export functionality will be implemented with backend integration');
  }

  getStudentName(): string {
    if (!this.selectedStudent) return '';
    return `${this.selectedStudent.firstName} ${this.selectedStudent.lastName}`;
  }

  getPresentCount(): number {
    return this.attendanceRecords.filter(r => r.status === 'PRESENT').length;
  }

  getAbsentCount(): number {
    return this.attendanceRecords.filter(r => r.status === 'ABSENT').length;
  }

  getLateCount(): number {
    return this.attendanceRecords.filter(r => r.status === 'LATE').length;
  }

  getExcusedCount(): number {
    return this.attendanceRecords.filter(r => r.status === 'EXCUSED').length;
  }
}
