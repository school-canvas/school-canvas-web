import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { StudentService } from '../../../../core/services/api/student.service';
import { Student } from '../../../../core/models/student.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ChildWithStats extends Student {
  attendanceRate?: number;
  currentGPA?: number;
  pendingFees?: number;
  upcomingEvents?: number;
}

@Component({
  selector: 'app-my-children',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatSnackBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './my-children.component.html',
  styleUrl: './my-children.component.css'
})
export class MyChildrenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  children: ChildWithStats[] = [];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChildren(): void {
    this.loading = true;
    
    // TODO: API Limitation - Need endpoint to get students by guardian/parent
    // For now, fetch all students and filter (this is a temporary solution)
    // Ideal: GuardianService.getStudentsByGuardian(guardianId)
    
    this.studentService.getAllStudents(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // TODO: In production, filter by current parent's guardianId
          // For demo, take first 3 students as children
          const allStudents = response.content || [];
          this.children = allStudents.slice(0, 3).map((student: Student) => ({
            ...student,
            // Mock statistics - in production, fetch from respective services
            attendanceRate: Math.floor(Math.random() * 20) + 80, // 80-100%
            currentGPA: parseFloat((Math.random() * 1 + 3).toFixed(2)), // 3.0-4.0
            pendingFees: Math.floor(Math.random() * 500), // $0-500
            upcomingEvents: Math.floor(Math.random() * 5) // 0-5 events
          }));
          
          this.loading = false;
        },
        error: (error: any) => {
          this.snackBar.open('Failed to load children', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  viewChildProgress(child: ChildWithStats): void {
    // Navigate to child progress page with child's ID
    this.router.navigate(['/parent/child-progress', child.id]);
  }

  viewAttendance(child: ChildWithStats): void {
    // Navigate to attendance view for this child
    this.router.navigate(['/parent/child-progress', child.id], { fragment: 'attendance' });
  }

  viewGrades(child: ChildWithStats): void {
    // Navigate to grades view for this child
    this.router.navigate(['/parent/child-progress', child.id], { fragment: 'grades' });
  }

  viewFees(child: ChildWithStats): void {
    // Navigate to fees page with child filter
    this.router.navigate(['/parent/fees'], { queryParams: { childId: child.id } });
  }

  contactTeacher(child: ChildWithStats): void {
    // TODO: Future Implementation - Contact Teacher Dialog
    // Show dialog with child's teachers and messaging interface
    this.snackBar.open('Contact Teacher - Feature needed', 'Close', { duration: 3000 });
  }

  viewReportCard(child: ChildWithStats): void {
    // TODO: Future Implementation - View/Download Report Card
    // Generate or fetch report card PDF for the selected child
    this.snackBar.open('View Report Card - Feature needed', 'Close', { duration: 3000 });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'INACTIVE':
        return 'warn';
      case 'GRADUATED':
        return 'accent';
      default:
        return '';
    }
  }

  getAttendanceColor(rate: number): string {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'danger';
  }

  goBack(): void {
    this.router.navigate(['/parent/dashboard']);
  }
}
