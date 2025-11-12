import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { ClassService } from '../../../../core/services/api/class.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  subject: string;
}

interface Assignment {
  id: string;
  title: string;
  type: 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT';
  totalPoints: number;
  dueDate: string;
  weight: number; // Percentage weight in final grade
}

interface StudentGrade {
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  email: string;
  grades: { [assignmentId: string]: number | null }; // null means not graded
  average: number;
  letterGrade: string;
}

@Component({
  selector: 'app-gradebook',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatSelectModule,
    PageHeaderComponent,
    StatsCardComponent
  ],
  templateUrl: './gradebook.component.html',
  styleUrl: './gradebook.component.css'
})
export class GradebookComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  saving = false;
  classId: string = '';
  classInfo: ClassInfo | null = null;
  assignments: Assignment[] = [];
  studentGrades: StudentGrade[] = [];
  displayedColumns: string[] = [];
  hasUnsavedChanges = false;
  
  // Editing state
  editingCell: { studentId: string; assignmentId: string } | null = null;
  editValue: string = '';

  // Filter options
  filterType: string = 'all';
  assignmentTypes = ['all', 'HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
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
          this.loadGradebookData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGradebookData(): void {
    this.loading = true;

    // Mock data - replace with actual API calls
    setTimeout(() => {
      this.classInfo = this.generateMockClassInfo();
      this.assignments = this.generateMockAssignments();
      this.studentGrades = this.generateMockStudentGrades();
      this.updateDisplayedColumns();
      this.loading = false;
    }, 500);
  }

  generateMockClassInfo(): ClassInfo {
    return {
      id: this.classId,
      name: 'Grade 10 Mathematics',
      section: 'A',
      subject: 'Mathematics'
    };
  }

  generateMockAssignments(): Assignment[] {
    const assignments: Assignment[] = [];
    const types: Array<'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT'> = ['HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT'];
    
    for (let i = 1; i <= 10; i++) {
      const type = types[(i - 1) % types.length];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - (10 - i) * 3);
      
      assignments.push({
        id: `assignment-${i}`,
        title: `${type} ${Math.ceil(i / 4)}`,
        type,
        totalPoints: type === 'EXAM' ? 100 : type === 'PROJECT' ? 50 : type === 'QUIZ' ? 20 : 10,
        dueDate: dueDate.toISOString(),
        weight: type === 'EXAM' ? 30 : type === 'PROJECT' ? 20 : type === 'QUIZ' ? 15 : 10
      });
    }
    return assignments;
  }

  generateMockStudentGrades(): StudentGrade[] {
    const students: StudentGrade[] = [];
    
    for (let i = 1; i <= 25; i++) {
      const grades: { [assignmentId: string]: number | null } = {};
      
      // Generate random grades for each assignment
      this.assignments.forEach(assignment => {
        const rand = Math.random();
        if (rand < 0.85) { // 85% have grades
          const percentage = 60 + Math.random() * 40; // 60-100%
          grades[assignment.id] = Math.round((percentage / 100) * assignment.totalPoints);
        } else {
          grades[assignment.id] = null; // Not graded yet
        }
      });
      
      const student: StudentGrade = {
        studentId: `student-${i}`,
        firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa'][i % 8],
        lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][i % 8],
        rollNumber: `2024${String(i).padStart(3, '0')}`,
        email: `student${i}@school.com`,
        grades,
        average: 0,
        letterGrade: ''
      };
      
      this.calculateStudentAverage(student);
      students.push(student);
    }
    
    return students;
  }

  updateDisplayedColumns(): void {
    this.displayedColumns = ['student', 'rollNumber'];
    
    const filteredAssignments = this.getFilteredAssignments();
    filteredAssignments.forEach(assignment => {
      this.displayedColumns.push(assignment.id);
    });
    
    this.displayedColumns.push('average', 'letterGrade', 'actions');
  }

  getFilteredAssignments(): Assignment[] {
    if (this.filterType === 'all') {
      return this.assignments;
    }
    return this.assignments.filter(a => a.type === this.filterType);
  }

  onFilterChange(): void {
    this.updateDisplayedColumns();
  }

  // Grade calculation
  calculateStudentAverage(student: StudentGrade): void {
    let totalPoints = 0;
    let earnedPoints = 0;
    let gradedAssignments = 0;

    this.assignments.forEach(assignment => {
      const grade = student.grades[assignment.id];
      if (grade !== null && grade !== undefined) {
        earnedPoints += grade;
        totalPoints += assignment.totalPoints;
        gradedAssignments++;
      }
    });

    if (totalPoints > 0) {
      student.average = Math.round((earnedPoints / totalPoints) * 100);
      student.letterGrade = this.getLetterGrade(student.average);
    } else {
      student.average = 0;
      student.letterGrade = 'N/A';
    }
  }

  getLetterGrade(percentage: number): string {
    if (percentage >= 97) return 'A+';
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

  // Inline editing
  startEdit(studentId: string, assignmentId: string, currentGrade: number | null): void {
    this.editingCell = { studentId, assignmentId };
    this.editValue = currentGrade !== null ? currentGrade.toString() : '';
  }

  cancelEdit(): void {
    this.editingCell = null;
    this.editValue = '';
  }

  saveGrade(studentId: string, assignmentId: string): void {
    const student = this.studentGrades.find(s => s.studentId === studentId);
    const assignment = this.assignments.find(a => a.id === assignmentId);
    
    if (!student || !assignment) return;

    const numValue = parseFloat(this.editValue);
    
    if (this.editValue === '' || this.editValue === null) {
      // Clear the grade
      student.grades[assignmentId] = null;
      this.hasUnsavedChanges = true;
    } else if (!isNaN(numValue) && numValue >= 0 && numValue <= assignment.totalPoints) {
      // Valid grade
      student.grades[assignmentId] = Math.round(numValue);
      this.hasUnsavedChanges = true;
    } else {
      // Invalid grade
      this.snackBar.open(`Grade must be between 0 and ${assignment.totalPoints}`, 'Close', { duration: 3000 });
      this.cancelEdit();
      return;
    }

    this.calculateStudentAverage(student);
    this.cancelEdit();
  }

  isEditing(studentId: string, assignmentId: string): boolean {
    return this.editingCell?.studentId === studentId && 
           this.editingCell?.assignmentId === assignmentId;
  }

  // Bulk operations
  saveAllGrades(): void {
    if (!this.hasUnsavedChanges) {
      this.snackBar.open('No changes to save', 'Close', { duration: 2000 });
      return;
    }

    this.saving = true;

    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      this.hasUnsavedChanges = false;
      this.snackBar.open('All grades saved successfully!', 'Close', { duration: 3000 });
    }, 1000);
  }

  exportGrades(): void {
    this.snackBar.open('Exporting grades to CSV...', 'Close', { duration: 2000 });
    // Implement CSV export logic
  }

  // Statistics
  getAssignmentAverage(assignmentId: string): number {
    let total = 0;
    let count = 0;

    this.studentGrades.forEach(student => {
      const grade = student.grades[assignmentId];
      if (grade !== null && grade !== undefined) {
        total += grade;
        count++;
      }
    });

    return count > 0 ? Math.round(total / count) : 0;
  }

  getAssignmentAveragePercentage(assignmentId: string): number {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) return 0;

    const avg = this.getAssignmentAverage(assignmentId);
    return Math.round((avg / assignment.totalPoints) * 100);
  }

  getClassAverage(): string {
    if (this.studentGrades.length === 0) return '0';
    
    const total = this.studentGrades.reduce((sum, student) => sum + student.average, 0);
    return (total / this.studentGrades.length).toFixed(1);
  }

  getGradedCount(assignmentId: string): number {
    return this.studentGrades.filter(s => s.grades[assignmentId] !== null).length;
  }

  // Utility methods
  getStudentName(student: StudentGrade): string {
    return `${student.firstName} ${student.lastName}`;
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 90) return '#2e7d32';
    if (percentage >= 80) return '#1976d2';
    if (percentage >= 70) return '#f57c00';
    if (percentage >= 60) return '#d32f2f';
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/teacher/classes', this.classId]);
  }

  viewStudentDetails(student: StudentGrade): void {
    console.log('View student details:', student);
  }
}
