import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';

import { FinanceService } from '../../../../core/services/api/finance.service';
import { Invoice, Payment, InvoiceStatus, PaymentMethod } from '../../../../core/models/finance.model';
import { InvoiceDialogComponent } from '../../components/invoice-dialog/invoice-dialog.component';
import { PaymentDialogComponent } from '../../components/payment-dialog/payment-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-finance-management',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    PageHeaderComponent,
    DataTableComponent,
    EmptyStateComponent,
    StatsCardComponent
  ],
  templateUrl: './finance-management.component.html',
  styleUrl: './finance-management.component.css'
})
export class FinanceManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  selectedTab = 0;
  
  // Invoices
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  
  // Payments
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  
  // Statistics
  totalRevenue = 0;
  pendingAmount = 0;
  paidAmount = 0;
  overdueAmount = 0;
  
  // Filters
  searchTerm = '';
  selectedStatus = 'all';
  selectedPaymentMethod = 'all';
  
  // Filter options
  invoiceStatuses = [
    { value: InvoiceStatus.PENDING, label: 'Pending' },
    { value: InvoiceStatus.PARTIALLY_PAID, label: 'Partially Paid' },
    { value: InvoiceStatus.PAID, label: 'Paid' },
    { value: InvoiceStatus.OVERDUE, label: 'Overdue' },
    { value: InvoiceStatus.CANCELLED, label: 'Cancelled' }
  ];
  
  paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Cash' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
    { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card' },
    { value: PaymentMethod.DEBIT_CARD, label: 'Debit Card' },
    { value: PaymentMethod.ONLINE, label: 'Online' },
    { value: PaymentMethod.CHECK, label: 'Check' },
    { value: PaymentMethod.OTHER, label: 'Other' }
  ];
  
  // Invoice Table Configuration
  invoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'studentName', label: 'Student', sortable: true },
    { key: 'invoiceDate', label: 'Invoice Date', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'totalAmount', label: 'Total Amount', sortable: true, type: 'number' },
    { key: 'paidAmount', label: 'Paid', sortable: true, type: 'number' },
    { key: 'balanceAmount', label: 'Balance', sortable: true, type: 'number' },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' }
  ];

  invoiceActions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewInvoiceDetails(row)
    },
    {
      icon: 'payment',
      label: 'Record Payment',
      handler: (row: any) => this.recordPayment(row),
      color: 'primary'
    },
    {
      icon: 'download',
      label: 'Download PDF',
      handler: (row: any) => this.downloadInvoice(row)
    }
  ];

  // Payment Table Configuration
  paymentColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'studentName', label: 'Student', sortable: true },
    { key: 'paymentDate', label: 'Payment Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, type: 'number' },
    { key: 'paymentMethod', label: 'Method', sortable: true },
    { key: 'transactionId', label: 'Transaction ID', sortable: false },
    { key: 'receivedByName', label: 'Received By', sortable: true }
  ];

  paymentActions: TableAction[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      handler: (row: any) => this.viewPaymentDetails(row)
    },
    {
      icon: 'receipt',
      label: 'Download Receipt',
      handler: (row: any) => this.downloadReceipt(row)
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices(): void {
    this.loading = true;
    this.financeService.getAllInvoices(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.invoices = (response.content || []).map((invoice: Invoice) => ({
            ...invoice,
            invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A',
            dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A',
            studentName: invoice.studentName || 'Unknown'
          }));
          
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          this.snackBar.open('Failed to load invoices', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  loadPayments(): void {
    // TODO: Need getAllPayments endpoint in FinanceService
    // For now, we'll show empty state
    this.payments = [];
    this.filteredPayments = [];
  }

  calculateStatistics(): void {
    this.totalRevenue = this.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    this.paidAmount = this.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    
    this.pendingAmount = this.invoices
      .filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.PARTIALLY_PAID)
      .reduce((sum, inv) => sum + inv.balanceAmount, 0);
    
    this.overdueAmount = this.invoices
      .filter(inv => inv.status === InvoiceStatus.OVERDUE)
      .reduce((sum, inv) => sum + inv.balanceAmount, 0);
  }

  applyFilters(): void {
    if (this.selectedTab === 0) {
      // Filter invoices
      this.filteredInvoices = this.invoices.filter(invoice => {
        const matchesSearch = !this.searchTerm || 
          (invoice.invoiceNumber || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (invoice.studentName || '').toLowerCase().includes(this.searchTerm.toLowerCase());
        
        const matchesStatus = this.selectedStatus === 'all' || 
          invoice.status === this.selectedStatus;
        
        return matchesSearch && matchesStatus;
      });
    } else {
      // Filter payments
      this.filteredPayments = this.payments.filter(payment => {
        const matchesSearch = !this.searchTerm || 
          (payment.invoiceNumber || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (payment.studentName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (payment.transactionId || '').toLowerCase().includes(this.searchTerm.toLowerCase());
        
        const matchesMethod = this.selectedPaymentMethod === 'all' || 
          payment.paymentMethod === this.selectedPaymentMethod;
        
        return matchesSearch && matchesMethod;
      });
    }
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.clearFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedPaymentMethod = 'all';
    this.applyFilters();
  }

  createInvoice(): void {
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      width: '900px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoices();
        this.snackBar.open('Invoice created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  viewInvoiceDetails(invoice: Invoice): void {
    // TODO: Future Implementation - Invoice Detail Dialog/Page
    // Show: Full invoice with line items, payment history, student info
    // Use FinanceService.getInvoiceById() for full details
    this.snackBar.open('Invoice Details - Dialog needed', 'Close', { duration: 3000 });
  }

  recordPayment(invoice: Invoice): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '700px',
      data: { invoice }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoices();
        this.loadPayments();
        this.snackBar.open('Payment recorded successfully', 'Close', { duration: 3000 });
      }
    });
  }

  downloadInvoice(invoice: Invoice): void {
    // TODO: Future Implementation - PDF Generation
    // Library: jspdf or pdfmake
    // Generate PDF with invoice details and download
    this.snackBar.open('Download Invoice - Feature needed', 'Close', { duration: 3000 });
  }

  viewPaymentDetails(payment: Payment): void {
    // TODO: Future Implementation - Payment Detail Dialog
    // Show: Full payment info, related invoice, receipt preview
    this.snackBar.open('Payment Details - Dialog needed', 'Close', { duration: 3000 });
  }

  downloadReceipt(payment: Payment): void {
    // TODO: Future Implementation - Receipt PDF Generation
    // Generate receipt PDF and download
    this.snackBar.open('Download Receipt - Feature needed', 'Close', { duration: 3000 });
  }

  exportFinancialReport(): void {
    // TODO: Future Implementation - Export Financial Report
    // Generate comprehensive report with:
    //   - Revenue breakdown
    //   - Payment trends
    //   - Outstanding amounts
    //   - Export to Excel/PDF
    this.snackBar.open('Export Report - Feature needed', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/principal/dashboard']);
  }
}
