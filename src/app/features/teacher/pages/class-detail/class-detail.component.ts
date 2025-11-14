import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ClassService } from '../../../../core/services/api/class.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';

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
  credits: number;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
}

interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  attendance: number;
  averageGrade: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Assignment {
  id: string;
  title: string;
  type: 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT';
  dueDate: string;
  totalPoints: number;
  submissionsCount: number;
  gradedCount: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

interface AttendanceRecord {
  date: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalStudents: number;
  attendanceRate: number;
}

@Component({
  selector: 'app-class-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatCheckboxModule,
    PageHeaderComponent,
    StatsCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.css'
})
export class ClassDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  classId: string = '';
  classInfo: ClassInfo | null = null;
  
  // Tab data
  students: Student[] = [];
  assignments: Assignment[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  
  // Table columns
  studentColumns: string[] = ['rollNumber', 'name', 'email', 'attendance', 'averageGrade', 'progress', 'actions'];
  assignmentColumns: string[] = ['title', 'type', 'dueDate', 'submissions', 'status', 'actions'];
  attendanceColumns: string[] = ['date', 'present', 'absent', 'late', 'rate'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private studentService: StudentService,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
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

    // Mock data - replace with actual API calls
    setTimeout(() => {
      this.classInfo = this.generateMockClassInfo();
      this.students = this.generateMockStudents();
      this.assignments = this.generateMockAssignments();
      this.attendanceRecords = this.generateMockAttendance();
      this.loading = false;
    }, 500);
  }

  generateMockClassInfo(): ClassInfo {
    return {
      id: this.classId,
      name: 'Grade 10 Mathematics',
      section: 'A',
      subject: 'Mathematics',
      gradeLevel: 'Grade 10',
      semester: 'Semester 1',
      academicYear: '2024-2025',
      schedule: 'Mon/Wed/Fri 9:00 AM - 10:30 AM',
      room: 'Room 101',
      credits: 4,
      description: 'Advanced mathematics covering algebra, geometry, and trigonometry.',
      status: 'ACTIVE'
    };
  }

  generateMockStudents(): Student[] {
    const students: Student[] = [];
    for (let i = 1; i <= 25; i++) {
      students.push({
        id: `student-${i}`,
        userId: `user-${i}`,
        firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'][i % 6],
        lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][i % 6],
        email: `student${i}@school.com`,
        rollNumber: `2024${String(i).padStart(3, '0')}`,
        attendance: 75 + Math.floor(Math.random() * 25),
        averageGrade: 65 + Math.floor(Math.random() * 35),
        assignmentsCompleted: 8 + Math.floor(Math.random() * 7),
        assignmentsTotal: 15,
        status: 'ACTIVE'
      });
    }
    return students;
  }

  generateMockAssignments(): Assignment[] {
    const assignments: Assignment[] = [];
    const types: Array<'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT'> = ['HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT'];
    
    for (let i = 1; i <= 15; i++) {
      const type = types[i % types.length];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i * 3) - 20);
      
      assignments.push({
        id: `assignment-${i}`,
        title: `${type} ${i}: ${['Algebra', 'Geometry', 'Trigonometry', 'Calculus'][i % 4]}`,
        type,
        dueDate: dueDate.toISOString(),
        totalPoints: type === 'EXAM' ? 100 : type === 'PROJECT' ? 50 : 20,
        submissionsCount: 18 + Math.floor(Math.random() * 7),
        gradedCount: 12 + Math.floor(Math.random() * 8),
        status: i <= 10 ? 'PUBLISHED' : i === 11 ? 'DRAFT' : 'CLOSED'
      });
    }
    return assignments;
  }

  generateMockAttendance(): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (i * 2));
      
      const totalStudents = 25;
      const presentCount = 20 + Math.floor(Math.random() * 5);
      const lateCount = Math.floor(Math.random() * 3);
      const absentCount = totalStudents - presentCount - lateCount;
      
      records.push({
        date: date.toISOString(),
        presentCount,
        absentCount,
        lateCount,
        totalStudents,
        attendanceRate: ((presentCount + lateCount) / totalStudents) * 100
      });
    }
    return records;
  }

  // Student actions
  viewStudentProfile(student: Student): void {
    console.log('View student profile:', student);
  }

  sendMessageToStudent(student: Student): void {
    console.log('Send message to student:', student);
  }

  viewStudentGrades(student: Student): void {
    this.router.navigate(['/teacher/gradebook', this.classId, 'student', student.id]);
  }

  // Assignment actions
  viewAssignment(assignment: Assignment): void {
    this.router.navigate(['/teacher/assignments', assignment.id]);
  }

  editAssignment(assignment: Assignment): void {
    console.log('Edit assignment:', assignment);
  }

  gradeAssignment(assignment: Assignment): void {
    this.router.navigate(['/teacher/assignments', assignment.id, 'grade']);
  }

  deleteAssignment(assignment: Assignment): void {
    console.log('Delete assignment:', assignment);
  }

  // Class actions
  takeAttendance(): void {
    this.router.navigate(['/teacher/attendance', this.classId]);
  }

  openGradebook(): void {
    this.router.navigate(['/teacher/gradebook', this.classId]);
  }

  createAssignment(): void {
    this.router.navigate(['/teacher/assignments', 'new'], { queryParams: { classId: this.classId } });
  }

  // Utility methods
  getStudentName(student: Student): string {
    return `${student.firstName} ${student.lastName}`;
  }

  getAttendanceColor(attendance: number): string {
    if (attendance >= 90) return '#2e7d32';
    if (attendance >= 75) return '#f57c00';
    return '#c62828';
  }

  getGradeColor(grade: number): string {
    if (grade >= 90) return '#2e7d32';
    if (grade >= 75) return '#1976d2';
    if (grade >= 60) return '#f57c00';
    return '#c62828';
  }

  getAssignmentTypeClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'HOMEWORK': 'type-homework',
      'QUIZ': 'type-quiz',
      'EXAM': 'type-exam',
      'PROJECT': 'type-project'
    };
    return typeMap[type] || '';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'status-draft',
      'PUBLISHED': 'status-published',
      'CLOSED': 'status-closed'
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

  getProgressPercentage(completed: number, total: number): number {
    return Math.round((completed / total) * 100);
  }

  getAverageAttendance(): string {
    if (this.students.length === 0) return '0';
    const avg = this.students.reduce((sum, s) => sum + s.attendance, 0) / this.students.length;
    return avg.toFixed(1);
  }

  getAverageGrade(): string {
    if (this.students.length === 0) return '0';
    const avg = this.students.reduce((sum, s) => sum + s.averageGrade, 0) / this.students.length;
    return avg.toFixed(1);
  }
}
