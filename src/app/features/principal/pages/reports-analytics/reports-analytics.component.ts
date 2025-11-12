import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { ChartComponent, ChartData } from '../../../../shared/components/chart/chart.component';

import { StudentService } from '../../../../core/services/api/student.service';
import { TeacherService } from '../../../../core/services/api/teacher.service';
import { ClassService } from '../../../../core/services/api/class.service';
import { FinanceService } from '../../../../core/services/api/finance.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reports-analytics',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatsCardComponent,
    ChartComponent
  ],
  templateUrl: './reports-analytics.component.html',
  styleUrl: './reports-analytics.component.css'
})
export class ReportsAnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  selectedTab = 0;
  selectedPeriod = 'current-year';
  
  // Overview Statistics
  totalStudents = 0;
  totalTeachers = 0;
  totalClasses = 0;
  totalRevenue = 0;
  
  // Student Analytics
  studentsByGrade: { [key: string]: number } = {};
  studentsByStatus: { [key: string]: number } = {};
  
  // Teacher Analytics
  teachersByDepartment: { [key: string]: number } = {};
  teachersByStatus: { [key: string]: number } = {};
  
  // Class Analytics
  classesBySubject: { [key: string]: number } = {};
  classEnrollmentStats = {
    underEnrolled: 0,
    optimal: 0,
    nearCapacity: 0,
    fullCapacity: 0
  };
  
  // Financial Analytics
  revenueByMonth: { month: string; amount: number }[] = [];
  pendingInvoices = 0;
  paidInvoices = 0;
  overdueInvoices = 0;
  
  // Period options
  periods = [
    { value: 'current-month', label: 'Current Month' },
    { value: 'current-quarter', label: 'Current Quarter' },
    { value: 'current-year', label: 'Current Year' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'all-time', label: 'All Time' }
  ];

  // Chart Data
  studentsByGradeChart!: ChartData;
  enrollmentTrendChart!: ChartData;
  teachersByDepartmentChart!: ChartData;
  revenueChart!: ChartData;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private classService: ClassService,
    private financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalytics(): void {
    this.loading = true;
    
    // Load data from all services in parallel
    forkJoin({
      students: this.studentService.getAllStudents(0, 1000),
      teachers: this.teacherService.getAllTeachers(0, 1000),
      classes: this.classService.getAllClasses(0, 1000),
      invoices: this.financeService.getAllInvoices(0, 1000)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        this.processStudentData(data.students.content || []);
        this.processTeacherData(data.teachers.content || []);
        this.processClassData(data.classes.content || []);
        this.processFinanceData(data.invoices.content || []);
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Failed to load analytics data', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  processStudentData(students: any[]): void {
    this.totalStudents = students.length;
    
    // Group by grade
    this.studentsByGrade = students.reduce((acc, student) => {
      const grade = student.gradeLevel || 'Unknown';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
    
    // Group by status
    this.studentsByStatus = students.reduce((acc, student) => {
      const status = student.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Prepare chart data
    this.studentsByGradeChart = {
      labels: Object.keys(this.studentsByGrade),
      datasets: [{
        label: 'Students by Grade',
        data: Object.values(this.studentsByGrade),
        backgroundColor: [
          '#3f51b5', '#2196F3', '#00BCD4', '#009688', '#4CAF50',
          '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
        ],
        borderWidth: 1
      }]
    };

    // Mock enrollment trend data
    this.enrollmentTrendChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Total Students',
        data: [950, 965, 980, 1020, 1050, 1080, 1100, 1150, 1200, 1180, 1190, this.totalStudents],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  processTeacherData(teachers: any[]): void {
    this.totalTeachers = teachers.length;
    
    // Group by department
    this.teachersByDepartment = teachers.reduce((acc, teacher) => {
      const dept = teacher.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    // Group by status
    this.teachersByStatus = teachers.reduce((acc, teacher) => {
      const status = teacher.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Prepare chart data
    this.teachersByDepartmentChart = {
      labels: Object.keys(this.teachersByDepartment),
      datasets: [{
        label: 'Teachers by Department',
        data: Object.values(this.teachersByDepartment),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ],
        borderWidth: 1
      }]
    };
  }

  processClassData(classes: any[]): void {
    this.totalClasses = classes.length;
    
    // Group by subject
    this.classesBySubject = classes.reduce((acc, classItem) => {
      const subject = classItem.subject || 'Unknown';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});
    
    // Enrollment statistics
    classes.forEach(classItem => {
      const enrollment = classItem.enrollmentCount || 0;
      const capacity = classItem.maxCapacity || 30;
      const percentage = (enrollment / capacity) * 100;
      
      if (percentage < 50) {
        this.classEnrollmentStats.underEnrolled++;
      } else if (percentage < 80) {
        this.classEnrollmentStats.optimal++;
      } else if (percentage < 100) {
        this.classEnrollmentStats.nearCapacity++;
      } else {
        this.classEnrollmentStats.fullCapacity++;
      }
    });
  }

  processFinanceData(invoices: any[]): void {
    this.totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    
    // Count by status
    this.pendingInvoices = invoices.filter(inv => inv.status === 'PENDING').length;
    this.paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;
    this.overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE').length;
    
    // Group revenue by month (mock data for demonstration)
    this.revenueByMonth = [
      { month: 'Jan', amount: this.totalRevenue * 0.08 },
      { month: 'Feb', amount: this.totalRevenue * 0.07 },
      { month: 'Mar', amount: this.totalRevenue * 0.09 },
      { month: 'Apr', amount: this.totalRevenue * 0.08 },
      { month: 'May', amount: this.totalRevenue * 0.10 },
      { month: 'Jun', amount: this.totalRevenue * 0.11 },
      { month: 'Jul', amount: this.totalRevenue * 0.09 },
      { month: 'Aug', amount: this.totalRevenue * 0.08 },
      { month: 'Sep', amount: this.totalRevenue * 0.09 },
      { month: 'Oct', amount: this.totalRevenue * 0.08 },
      { month: 'Nov', amount: this.totalRevenue * 0.07 },
      { month: 'Dec', amount: this.totalRevenue * 0.06 }
    ];

    // Prepare revenue chart
    this.revenueChart = {
      labels: this.revenueByMonth.map(r => r.month),
      datasets: [{
        label: 'Monthly Revenue',
        data: this.revenueByMonth.map(r => r.amount),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  onPeriodChange(): void {
    // TODO: Filter data based on selected period
    // For now, just reload all data
    this.loadAnalytics();
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  exportReport(type: string): void {
    // TODO: Future Implementation - Export Reports
    // Library: xlsx for Excel, jspdf for PDF
    // Options:
    //   - Export current view as PDF
    //   - Export data as Excel spreadsheet
    //   - Include charts as images
    //   - Customizable report templates
    this.snackBar.open(`Export ${type} Report - Feature needed`, 'Close', { duration: 3000 });
  }

  generateCustomReport(): void {
    // TODO: Future Implementation - Custom Report Builder
    // Features:
    //   - Select report type (student, teacher, financial, etc.)
    //   - Choose date range
    //   - Select metrics to include
    //   - Choose visualization type
    //   - Schedule recurring reports
    //   - Email delivery option
    this.snackBar.open('Custom Report Builder - Feature needed', 'Close', { duration: 3000 });
  }

  viewDetailedReport(category: string): void {
    // TODO: Future Implementation - Detailed Report Views
    // Navigate to dedicated report pages with advanced filtering and drill-down
    this.snackBar.open(`View ${category} Details - Feature needed`, 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/principal/dashboard']);
  }
}
