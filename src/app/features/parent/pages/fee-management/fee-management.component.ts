import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { StudentService } from '../../../../core/services/api/student.service';
import { FinanceService } from '../../../../core/services/api/finance.service';
import { Student, Invoice, Payment } from '../../../../core/models';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ChildWithFees extends Student {
  totalDue: number;
  totalPaid: number;
  invoiceCount: number;
  paymentCount: number;
}

@Component({
  selector: 'app-fee-management',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatsCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './fee-management.component.html',
  styleUrl: './fee-management.component.css'
})
export class FeeManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  children: ChildWithFees[] = [];
  selectedChild: ChildWithFees | null = null;
  
  // Invoice & Payment Data
  invoices: Invoice[] = [];
  payments: Payment[] = [];
  invoiceDisplayColumns = ['invoiceNumber', 'dueDate', 'amount', 'status', 'actions'];
  paymentDisplayColumns = ['paymentDate', 'amount', 'method', 'reference'];
  
  // Stats
  totalDue = 0;
  totalPaid = 0;
  pendingInvoices = 0;
  overdueInvoices = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private financeService: FinanceService,
    private snackBar: MatSnackBar
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

    // TODO: API Limitation - Need GuardianService.getStudentsByGuardian(guardianId)
    // Temporary: Fetch all students and take first 3 as demo children
    this.studentService.getAllStudents(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const allStudents = response.content || [];
          const demoChildren = allStudents.slice(0, 3);
          
          // Load fee data for each child
          if (demoChildren.length === 0) {
            this.children = [];
            this.loading = false;
            return;
          }

          const childFeeRequests: any[] = demoChildren.map((student: Student) => 
            forkJoin({
              student: Promise.resolve(student),
              invoices: this.financeService.getInvoicesByStudent(student.userId, 0, 100),
              payments: this.financeService.getPaymentsByStudent(student.userId, 0, 100)
            })
          );
          
          if (childFeeRequests.length > 0) {
            (forkJoin(childFeeRequests) as any)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (results: any[]) => {
                  this.children = results.map((result: any) => {
                    const invoicesResponse: any = result.invoices;
                    const paymentsResponse: any = result.payments;
                    const invoices = invoicesResponse.content || [];
                    const payments = paymentsResponse.content || [];
                    
                    const totalDue = invoices.reduce((sum: number, inv: Invoice) => sum + (inv.totalAmount || 0), 0);
                    const totalPaid = payments.reduce((sum: number, pay: Payment) => sum + (pay.amount || 0), 0);
                    
                    return {
                      ...result.student,
                      totalDue,
                      totalPaid,
                      invoiceCount: invoices.length,
                      paymentCount: payments.length
                    } as ChildWithFees;
                  });
                  
                  // Auto-select first child or one from query params
                  const childIdParam = this.route.snapshot.queryParamMap.get('childId');
                  if (childIdParam) {
                    this.selectedChild = this.children.find(c => c.userId === childIdParam) || this.children[0] || null;
                  } else {
                    this.selectedChild = this.children[0] || null;
                  }
                  
                  if (this.selectedChild) {
                    this.loadChildFees(this.selectedChild.userId);
                  } else {
                    this.loading = false;
                  }
                },
                error: (error: any) => {
                  console.error('Error loading children fees:', error);
                  this.snackBar.open('Failed to load fee data', 'Close', { duration: 3000 });
                  this.loading = false;
                }
              });
          }
        },
        error: (error: any) => {
          console.error('Error loading children:', error);
          this.snackBar.open('Failed to load children', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  loadChildFees(userId: string): void {
    this.loading = true;

    forkJoin({
      invoices: this.financeService.getInvoicesByStudent(userId, 0, 100),
      payments: this.financeService.getPaymentsByStudent(userId, 0, 100)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          const invoicesResponse: any = results.invoices;
          const paymentsResponse: any = results.payments;
          
          this.invoices = invoicesResponse.content || [];
          this.payments = paymentsResponse.content || [];
          
          // Calculate stats
          this.totalDue = this.invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
          this.totalPaid = this.payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
          this.pendingInvoices = this.invoices.filter(inv => inv.status === 'PENDING').length;
          
          const today = new Date();
          this.overdueInvoices = this.invoices.filter(inv => {
            if (inv.status !== 'PAID' && inv.dueDate) {
              return new Date(inv.dueDate) < today;
            }
            return false;
          }).length;
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading fees:', error);
          this.snackBar.open('Failed to load fee details', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  onChildChange(child: ChildWithFees): void {
    this.selectedChild = child;
    this.loadChildFees(child.userId);
  }

  getInvoiceStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'status-paid';
      case 'PENDING':
        return 'status-pending';
      case 'OVERDUE':
        return 'status-overdue';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${amount.toFixed(2)}`;
  }

  viewInvoice(invoice: Invoice): void {
    // TODO: Show invoice details in dialog
    this.snackBar.open('View Invoice Details - Feature needed', 'Close', { duration: 3000 });
  }

  payInvoice(invoice: Invoice): void {
    // TODO: Show payment form dialog
    this.snackBar.open('Pay Invoice - Feature needed', 'Close', { duration: 3000 });
  }

  downloadInvoice(invoice: Invoice): void {
    // TODO: Generate and download invoice PDF
    this.snackBar.open('Download Invoice - Feature needed', 'Close', { duration: 3000 });
  }

  downloadReceipt(payment: Payment): void {
    // TODO: Generate and download payment receipt PDF
    this.snackBar.open('Download Receipt - Feature needed', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/parent/children']);
  }
}
