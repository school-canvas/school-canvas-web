import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StudentService } from '../../../../core/services/student.service';
import { selectUser } from '../../../auth/state/auth.selectors';

interface Invoice {
  id: string;
  studentId: string;
  invoiceNumber: string;
  description: string;
  category: 'TUITION' | 'EXAM' | 'LIBRARY' | 'TRANSPORT' | 'HOSTEL' | 'MISCELLANEOUS';
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  paidAmount: number;
  remainingAmount: number;
  issueDate: string;
  academicYear: string;
  semester: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE';
  transactionId?: string;
  remarks?: string;
  receiptNumber: string;
}

interface FeeStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

@Component({
  selector: 'app-fee-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    PageHeaderComponent,
    StatsCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './fee-payment.component.html',
  styleUrl: './fee-payment.component.css'
})
export class FeePaymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  studentId: string = '';
  selectedTab = 0;
  Math = Math; // For template access

  // Filters
  statusFilter = new FormControl('all');
  categoryFilter = new FormControl('all');
  academicYearFilter = new FormControl('all');

  // Data
  allInvoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  payments: Payment[] = [];
  
  categories = ['all', 'TUITION', 'EXAM', 'LIBRARY', 'TRANSPORT', 'HOSTEL', 'MISCELLANEOUS'];
  academicYears = ['all', '2024-2025', '2023-2024', '2022-2023'];
  
  stats: FeeStats = {
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  };

  // Table configuration
  invoiceColumns: string[] = ['invoiceNumber', 'description', 'category', 'amount', 'dueDate', 'status', 'actions'];
  paymentColumns: string[] = ['receiptNumber', 'invoiceNumber', 'amount', 'paymentDate', 'method'];

  constructor(
    private studentService: StudentService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(take(1))
      .subscribe(user => {
        if (user?.id) {
          this.studentId = user.id;
          this.loadFeeData();
        }
      });

    // Filter subscriptions
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.categoryFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.academicYearFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeeData(): void {
    this.loading = true;

    // Mock fee data - replace with actual API calls
    setTimeout(() => {
      this.allInvoices = this.generateMockInvoices();
      this.payments = this.generateMockPayments();
      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  generateMockInvoices(): Invoice[] {
    const invoices: Invoice[] = [];
    const today = new Date();
    const categories: Array<'TUITION' | 'EXAM' | 'LIBRARY' | 'TRANSPORT' | 'HOSTEL' | 'MISCELLANEOUS'> = 
      ['TUITION', 'EXAM', 'LIBRARY', 'TRANSPORT', 'HOSTEL', 'MISCELLANEOUS'];

    for (let i = 1; i <= 10; i++) {
      const category = categories[i % categories.length];
      const amount = category === 'TUITION' ? 5000 : category === 'TRANSPORT' ? 500 : 300;
      const issueDate = new Date(today);
      issueDate.setMonth(today.getMonth() - i);
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(issueDate.getDate() + 30);
      
      const isOverdue = dueDate < today;
      const isPaid = i % 3 === 0;
      const isPartial = i % 4 === 0 && !isPaid;
      
      const paidAmount = isPaid ? amount : isPartial ? amount * 0.5 : 0;
      const remainingAmount = amount - paidAmount;

      invoices.push({
        id: `invoice-${i}`,
        studentId: this.studentId,
        invoiceNumber: `INV-2024-${String(i).padStart(4, '0')}`,
        description: `${category.replace('_', ' ')} Fee - Semester ${i % 2 + 1}`,
        category,
        amount,
        dueDate: dueDate.toISOString(),
        status: isPaid ? 'PAID' : isPartial ? 'PARTIAL' : isOverdue ? 'OVERDUE' : 'PENDING',
        paidAmount,
        remainingAmount,
        issueDate: issueDate.toISOString(),
        academicYear: '2024-2025',
        semester: `Semester ${i % 2 + 1}`
      });
    }

    return invoices;
  }

  generateMockPayments(): Payment[] {
    const payments: Payment[] = [];
    const paidInvoices = this.allInvoices.filter(inv => inv.status === 'PAID' || inv.status === 'PARTIAL');
    const methods: Array<'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE'> = 
      ['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE'];

    paidInvoices.forEach((invoice, index) => {
      payments.push({
        id: `payment-${index + 1}`,
        invoiceId: invoice.id,
        invoice,
        studentId: this.studentId,
        amount: invoice.paidAmount,
        paymentDate: new Date(invoice.issueDate).toISOString(),
        paymentMethod: methods[index % methods.length],
        transactionId: `TXN-${Date.now()}-${index}`,
        receiptNumber: `RCP-2024-${String(index + 1).padStart(4, '0')}`,
        remarks: 'Payment received successfully'
      });
    });

    return payments;
  }

  calculateStats(): void {
    const totalInvoices = this.allInvoices.length;
    const totalAmount = this.allInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = this.allInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingAmount = this.allInvoices
      .filter(inv => inv.status === 'PENDING')
      .reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const overdueAmount = this.allInvoices
      .filter(inv => inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + inv.remainingAmount, 0);

    this.stats = {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount
    };
  }

  applyFilters(): void {
    let filtered = [...this.allInvoices];

    // Status filter
    const status = this.statusFilter.value;
    if (status && status !== 'all') {
      filtered = filtered.filter(inv => inv.status === status);
    }

    // Category filter
    const category = this.categoryFilter.value;
    if (category && category !== 'all') {
      filtered = filtered.filter(inv => inv.category === category);
    }

    // Academic year filter
    const year = this.academicYearFilter.value;
    if (year && year !== 'all') {
      filtered = filtered.filter(inv => inv.academicYear === year);
    }

    this.filteredInvoices = filtered;
  }

  payInvoice(invoice: Invoice): void {
    console.log('Pay invoice:', invoice.invoiceNumber);
    // TODO: Implement payment modal/flow
  }

  downloadInvoice(invoice: Invoice): void {
    console.log('Download invoice:', invoice.invoiceNumber);
    // TODO: Implement PDF download
  }

  downloadReceipt(payment: Payment): void {
    console.log('Download receipt:', payment.receiptNumber);
    // TODO: Implement receipt download
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': 'status-paid',
      'PENDING': 'status-pending',
      'OVERDUE': 'status-overdue',
      'PARTIAL': 'status-partial'
    };
    return statusMap[status] || '';
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'TUITION': 'school',
      'EXAM': 'assignment',
      'LIBRARY': 'local_library',
      'TRANSPORT': 'directions_bus',
      'HOSTEL': 'hotel',
      'MISCELLANEOUS': 'more_horiz'
    };
    return iconMap[category] || 'payment';
  }

  getPaymentMethodIcon(method: string): string {
    const iconMap: { [key: string]: string } = {
      'CASH': 'payments',
      'CARD': 'credit_card',
      'BANK_TRANSFER': 'account_balance',
      'ONLINE': 'language',
      'CHEQUE': 'receipt'
    };
    return iconMap[method] || 'payment';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  clearFilters(): void {
    this.statusFilter.setValue('all');
    this.categoryFilter.setValue('all');
    this.academicYearFilter.setValue('all');
  }

  isOverdue(invoice: Invoice): boolean {
    return invoice.status === 'OVERDUE';
  }

  getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
