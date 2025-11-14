import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Store } from '@ngrx/store';

import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { GuardianService } from '../../../../core/services/api/guardian.service';
import { StudentService } from '../../../../core/services/api/student.service';
import { FinanceService } from '../../../../core/services/api/finance.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { selectUser } from '../../../auth/state/auth.selectors';
import { forkJoin, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    StatsCardComponent,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent
  ],
  templateUrl: './parent-dashboard.component.html',
  styleUrl: './parent-dashboard.component.css'
})
export class ParentDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  currentUserId: string = '';
  guardianProfile: any;
  children: any[] = [];
  selectedChildIndex = 0;
  
  // Stats for selected child
  attendanceRate = 0;
  totalClasses = 0;
  pendingFees = 0;
  upcomingEvents = 0;
  averageGrade = 0;
  totalChildren = 0;

  // Data arrays
  childClasses: any[] = [];
  recentGrades: any[] = [];
  feeInvoices: any[] = [];
  
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
    { key: 'marksObtained', label: 'Marks Obtained', sortable: false },
    { key: 'totalMarks', label: 'Total Marks', sortable: false },
    { key: 'percentage', label: 'Percentage', sortable: true }
  ];

  feeColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  feeActions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewInvoiceDetails(row)
    }
  ];

  constructor(
    private store: Store,
    private guardianService: GuardianService,
    private studentService: StudentService,
    private financeService: FinanceService,
    private attendanceService: AttendanceService,
    private assessmentService: AssessmentService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      if (user?.id) {
        this.currentUserId = user.id;
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // For now, mock the guardian profile and children
    // In a real scenario, you would have a getGuardianByUserId endpoint
    // or use the user's ID to fetch guardian info
    
    // Mock guardian profile
    this.guardianProfile = {
      id: 'guardian-1',
      firstName: 'Parent',
      lastName: 'User',
      userId: this.currentUserId
    };
    
    // Mock children - in real scenario, fetch from backend
    this.studentService.getAllStudents(0, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Take first 2-3 students as children for demo
          this.children = (response.content || []).slice(0, 2);
          this.totalChildren = this.children.length;
          
          if (this.children.length > 0) {
            this.loadChildData(this.children[0]);
          } else {
            this.loading = false;
          }
        },
        error: (error: any) => {
          console.error('Error loading children:', error);
          this.loading = false;
        }
      });
  }

  onChildTabChanged(index: number): void {
    this.selectedChildIndex = index;
    if (this.children[index]) {
      this.loadChildData(this.children[index]);
    }
  }

  loadChildData(child: any): void {
    this.loading = true;
    
    // Load all child-specific data in parallel
    forkJoin({
      classes: this.classService.getAllClasses(0, 5),
      grades: this.assessmentService.getAllAssessments(0, 5),
      attendance: this.attendanceService.getStudentAttendanceSummary(child.id),
      invoices: this.financeService.getAllInvoices(0, 5)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results) => {
        // Process classes
        this.childClasses = results.classes.content || [];
        this.totalClasses = results.classes.totalElements || 0;
        
        // Process grades
        this.recentGrades = results.grades.content || [];
        if (this.recentGrades.length > 0) {
          const totalPercentage = this.recentGrades.reduce((sum: number, grade: any) => {
            const percentage = (grade.marksObtained / grade.totalMarks) * 100;
            return sum + percentage;
          }, 0);
          this.averageGrade = totalPercentage / this.recentGrades.length;
        }
        
        // Process attendance
        this.attendanceRate = results.attendance.attendancePercentage || 0;
        
        // Process invoices
        this.feeInvoices = results.invoices.content || [];
        this.pendingFees = this.feeInvoices
          .filter((invoice: any) => invoice.status === 'PENDING')
          .reduce((sum: number, invoice: any) => sum + invoice.amount, 0);
        
        // Mock upcoming events (would come from Event service)
        this.upcomingEvents = 3;
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading child data:', error);
        this.loading = false;
      }
    });
  }

  payFee(invoice: any): void {
    console.log('Pay fee for invoice:', invoice);
    // TODO: Navigate to payment page or open payment dialog
  }

  viewReceipt(invoice: any): void {
    console.log('View receipt for invoice:', invoice);
    // TODO: Navigate to receipt view or open dialog
  }

  viewInvoiceDetails(invoice: any): void {
    console.log('View invoice details:', invoice);
    // TODO: Navigate to invoice detail page
  }

  contactTeacher(): void {
    console.log('Contact teacher');
    // TODO: Navigate to communication page
  }

  viewReportCard(): void {
    console.log('View report card');
    // TODO: Navigate to report card page
  }

  viewCalendar(): void {
    console.log('View calendar');
    // TODO: Navigate to calendar page
  }

  viewAllClasses(): void {
    console.log('View all classes');
    // TODO: Navigate to classes list
  }

  viewAllGrades(): void {
    console.log('View all grades');
    // TODO: Navigate to grades list
  }

  viewAllInvoices(): void {
    console.log('View all invoices');
    // TODO: Navigate to invoices list
  }
}
