import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { StudentService } from '../../../../core/services/api/student.service';
import { TeacherService } from '../../../../core/services/api/teacher.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { FinanceService } from '../../../../core/services/api/finance.service';
import { AttendanceService } from '../../../../core/services/api/attendance.service';
import { AuditLogService } from '../../../../core/services/api/audit-log.service';
import { ReportService } from '../../../../core/services/api/report.service';
import { selectUser } from '../../../auth/state/auth.selectors';

@Component({
  selector: 'app-principal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatChipsModule,
    StatsCardComponent,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent
  ],
  templateUrl: './principal-dashboard.component.html',
  styleUrl: './principal-dashboard.component.css'
})
export class PrincipalDashboardComponent implements OnInit {
  loading = true;
  currentUserId: string = '';
  
  // Stats
  totalStudents = 0;
  totalTeachers = 0;
  totalClasses = 0;
  activeTeachers = 0;
  pendingPayments = 0;
  monthlyRevenue = 0;
  attendanceRate = 0;
  
  // Data
  recentStudents: any[] = [];
  recentTeachers: any[] = [];
  pendingInvoices: any[] = [];
  recentAuditLogs: any[] = [];
  
  // Table configurations
  studentColumns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'enrollmentDate', label: 'Enrolled', sortable: true }
  ];

  teacherColumns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'status', label: 'Status', sortable: true }
  ];

  invoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'studentName', label: 'Student', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true }
  ];

  auditColumns: TableColumn[] = [
    { key: 'action', label: 'Action', sortable: true },
    { key: 'userName', label: 'User', sortable: true },
    { key: 'entityType', label: 'Entity', sortable: true },
    { key: 'timestamp', label: 'Time', sortable: true }
  ];

  studentActions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Profile',
      handler: (row: any) => this.viewStudent(row)
    },
    {
      icon: 'edit',
      label: 'Edit',
      handler: (row: any) => this.editStudent(row),
      color: 'accent'
    }
  ];

  teacherActions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Profile',
      handler: (row: any) => this.viewTeacher(row)
    },
    {
      icon: 'edit',
      label: 'Edit',
      handler: (row: any) => this.editTeacher(row),
      color: 'accent'
    }
  ];

  invoiceActions: TableAction[] = [
    {
      icon: 'receipt',
      label: 'View Invoice',
      handler: (row: any) => this.viewInvoice(row)
    },
    {
      icon: 'send',
      label: 'Send Reminder',
      handler: (row: any) => this.sendReminder(row),
      color: 'warn'
    }
  ];

  constructor(
    private store: Store,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private classService: ClassService,
    private financeService: FinanceService,
    private attendanceService: AttendanceService,
    private auditLogService: AuditLogService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser).subscribe(user => {
      if (user?.id) {
        this.currentUserId = user.id;
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load all dashboard data in parallel
    this.loadStudents();
    this.loadTeachers();
    this.loadClasses();
    this.loadFinanceData();
    this.loadAuditLogs();
  }

  loadStudents(): void {
    this.studentService.getAllStudents(0, 5).subscribe({
      next: (response: any) => {
        this.recentStudents = response.content || [];
        this.totalStudents = response.totalElements || 0;
      },
      error: (error: any) => console.error('Error loading students:', error)
    });
  }

  loadTeachers(): void {
    this.teacherService.getAllTeachers(0, 5).subscribe({
      next: (response: any) => {
        this.recentTeachers = response.content || [];
        this.totalTeachers = response.totalElements || 0;
        this.activeTeachers = this.recentTeachers.filter((t: any) => 
          t.status === 'ACTIVE'
        ).length;
      },
      error: (error: any) => console.error('Error loading teachers:', error)
    });
  }

  loadClasses(): void {
    this.classService.getAllClasses(0, 1).subscribe({
      next: (response: any) => {
        this.totalClasses = response.totalElements || 0;
      },
      error: (error: any) => console.error('Error loading classes:', error)
    });
  }

  loadFinanceData(): void {
    this.financeService.getAllInvoices(0, 5).subscribe({
      next: (response: any) => {
        this.pendingInvoices = response.content || [];
        // Count pending/unpaid invoices
        this.pendingPayments = this.pendingInvoices.filter((inv: any) => 
          inv.status === 'PENDING' || inv.status === 'OVERDUE'
        ).length;
        // Calculate total revenue
        this.monthlyRevenue = this.pendingInvoices.reduce((sum: number, inv: any) => 
          sum + (inv.totalAmount || 0), 0);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading finance data:', error);
        this.loading = false;
      }
    });
  }

  loadAuditLogs(): void {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days
    
    this.auditLogService.getAuditLogsByDateRange(startDate, endDate, 0, 10).subscribe({
      next: (response: any) => {
        this.recentAuditLogs = response.content || [];
      },
      error: (error: any) => console.error('Error loading audit logs:', error)
    });
  }

  // Navigation handlers
  viewStudent(student: any): void {
    console.log('View student:', student);
  }

  editStudent(student: any): void {
    console.log('Edit student:', student);
  }

  viewTeacher(teacher: any): void {
    console.log('View teacher:', teacher);
  }

  editTeacher(teacher: any): void {
    console.log('Edit teacher:', teacher);
  }

  viewInvoice(invoice: any): void {
    console.log('View invoice:', invoice);
  }

  sendReminder(invoice: any): void {
    console.log('Send reminder for invoice:', invoice);
  }

  onPageChange(event: any): void {
    console.log('Page changed:', event);
  }

  onSortChange(event: any): void {
    console.log('Sort changed:', event);
  }

  // Quick action handlers
  generateReport(type: string): void {
    console.log('Generate report:', type);
    // Navigate to report generation
  }

  manageUsers(): void {
    console.log('Manage users');
    // Navigate to user management
  }

  viewReports(): void {
    console.log('View reports');
    // Navigate to reports
  }

  viewAuditLogs(): void {
    console.log('View audit logs');
    // Navigate to full audit log view
  }
}
