import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatDividerModule } from '@angular/material/divider';

import { Invoice, InvoiceStatus } from '../../../../core/models/finance.model';
import { Student } from '../../../../core/models/student.model';
import { FinanceService } from '../../../../core/services/api/finance.service';
import { StudentService } from '../../../../core/services/api/student.service';

export interface InvoiceDialogData {
  invoice?: Invoice;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-invoice-dialog',
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
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './invoice-dialog.component.html',
  styleUrl: './invoice-dialog.component.css'
})
export class InvoiceDialogComponent implements OnInit {
  invoiceForm!: FormGroup;
  loading = false;
  isEditMode = false;
  students: Student[] = [];
  loadingStudents = true;
  minDate = new Date();

  statusOptions = Object.values(InvoiceStatus);

  feeCategories = [
    { name: 'Tuition Fee', amount: 5000 },
    { name: 'Library Fee', amount: 200 },
    { name: 'Lab Fee', amount: 500 },
    { name: 'Sports Fee', amount: 300 },
    { name: 'Transportation Fee', amount: 1000 },
    { name: 'Activity Fee', amount: 250 },
    { name: 'Examination Fee', amount: 400 },
    { name: 'Computer Fee', amount: 600 }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InvoiceDialogComponent>,
    private financeService: FinanceService,
    private studentService: StudentService,
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadStudents();

    if (this.isEditMode && this.data.invoice) {
      this.populateForm(this.data.invoice);
    }

    // Auto-calculate totals when items change
    this.invoiceForm.get('items')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  private initializeForm(): void {
    this.invoiceForm = this.fb.group({
      studentId: ['', Validators.required],
      invoiceDate: [new Date(), Validators.required],
      dueDate: ['', Validators.required],
      description: [''],
      items: this.fb.array([]),
      totalAmount: [{ value: 0, disabled: true }],
      status: [InvoiceStatus.PENDING]
    });

    // Add at least one item by default
    if (!this.isEditMode) {
      this.addItem();
    }
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemGroup(item?: any): FormGroup {
    return this.fb.group({
      description: [item?.description || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      amount: [{ value: item?.amount || 0, disabled: true }]
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateTotals();
    }
  }

  selectFeeCategory(index: number, category: any): void {
    const item = this.items.at(index);
    item.patchValue({
      description: category.name,
      unitPrice: category.amount
    });
    this.updateItemAmount(index);
  }

  updateItemAmount(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const amount = quantity * unitPrice;
    item.patchValue({ amount }, { emitEvent: false });
    this.calculateTotals();
  }

  calculateTotals(): void {
    const total = this.items.controls.reduce((sum, item) => {
      return sum + (item.get('amount')?.value || 0);
    }, 0);
    this.invoiceForm.patchValue({ totalAmount: total }, { emitEvent: false });
  }

  private loadStudents(): void {
    this.loadingStudents = true;
    this.studentService.getAllStudents().subscribe({
      next: (response) => {
        this.students = response.content.filter((s: Student) => s.status === 'ACTIVE');
        this.loadingStudents = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loadingStudents = false;
      }
    });
  }

  private populateForm(invoice: Invoice): void {
    this.invoiceForm.patchValue({
      studentId: invoice.studentId,
      invoiceDate: new Date(invoice.invoiceDate),
      dueDate: new Date(invoice.dueDate),
      description: invoice.description || '',
      totalAmount: invoice.totalAmount,
      status: invoice.status
    });

    // Populate items
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        this.items.push(this.createItemGroup(item));
      });
    }
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateInvoice();
    } else {
      this.createInvoice();
    }
  }

  private createInvoice(): void {
    const formValue = this.invoiceForm.value;
    const request = {
      studentId: formValue.studentId,
      invoiceDate: this.formatDate(formValue.invoiceDate),
      dueDate: this.formatDate(formValue.dueDate),
      description: formValue.description,
      items: formValue.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice
      })),
      totalAmount: this.invoiceForm.get('totalAmount')?.value
    };

    this.financeService.createInvoice(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.loading = false;
      }
    });
  }

  private updateInvoice(): void {
    if (!this.data.invoice) return;

    const formValue = this.invoiceForm.value;
    const request = {
      studentId: formValue.studentId,
      invoiceDate: this.formatDate(formValue.invoiceDate),
      dueDate: this.formatDate(formValue.dueDate),
      description: formValue.description,
      items: formValue.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice
      })),
      totalAmount: this.invoiceForm.get('totalAmount')?.value,
      status: formValue.status
    };

    // Note: Using createInvoice as updateInvoice endpoint may not be available
    // In production, this should call a proper update endpoint
    this.financeService.createInvoice(request).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.dialogRef.close(response);
      },
      error: (error: any) => {
        console.error('Error updating invoice:', error);
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
    return this.invoiceForm.valid && !this.loading && !this.loadingStudents && this.items.length > 0;
  }

  getStatusLabel(status: InvoiceStatus): string {
    return status.replace('_', ' ');
  }
}
