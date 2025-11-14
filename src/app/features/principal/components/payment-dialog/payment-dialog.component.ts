import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Invoice, PaymentMethod, RecordPaymentRequest } from '../../../../core/models/finance.model';
import { FinanceService } from '../../../../core/services/api/finance.service';

export interface PaymentDialogData {
  invoice: Invoice;
}

@Component({
  selector: 'app-payment-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.css'
})
export class PaymentDialogComponent implements OnInit {
  paymentForm!: FormGroup;
  loading = false;
  invoice: Invoice;
  maxDate = new Date();

  paymentMethods = Object.values(PaymentMethod);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaymentDialogComponent>,
    private financeService: FinanceService,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.invoice = data.invoice;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const remainingBalance = this.invoice.balanceAmount || this.invoice.totalAmount;
    
    this.paymentForm = this.fb.group({
      amount: [remainingBalance, [Validators.required, Validators.min(0.01), Validators.max(remainingBalance)]],
      paymentDate: [new Date(), Validators.required],
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      transactionId: [''],
      remarks: ['']
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.recordPayment();
  }

  private recordPayment(): void {
    const formValue = this.paymentForm.value;
    const request: RecordPaymentRequest = {
      invoiceId: this.invoice.id,
      amount: formValue.amount,
      paymentDate: this.formatDate(formValue.paymentDate),
      paymentMethod: formValue.paymentMethod,
      transactionId: formValue.transactionId,
      remarks: formValue.remarks
    };

    this.financeService.createPayment(request).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.dialogRef.close(response);
      },
      error: (error: any) => {
        console.error('Error recording payment:', error);
        this.loading = false;
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get isFormValid(): boolean {
    return this.paymentForm.valid && !this.loading;
  }

  get remainingBalance(): number {
    return this.invoice.balanceAmount || this.invoice.totalAmount;
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    return method.replace('_', ' ');
  }
}
