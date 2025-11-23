import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventService } from '../../../core/services/api/event.service';
import { CreateEventCategoryRequest, EventCategory } from '../../../core/models';

@Component({
  selector: 'app-event-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './event-category-dialog.component.html',
  styleUrl: './event-category-dialog.component.css'
})
export class EventCategoryDialogComponent implements OnInit {
  categoryForm!: FormGroup;
  submitting = false;
  isEdit = false;
  category?: EventCategory;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { category?: EventCategory },
    private dialogRef: MatDialogRef<EventCategoryDialogComponent>,
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    this.category = data?.category;
    this.isEdit = !!this.category;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: [this.category?.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.category?.description || ''],
      color: [this.category?.color || '#2196F3']
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    const request: CreateEventCategoryRequest = this.categoryForm.value;

    this.submitting = true;
    const operation = this.isEdit
      ? this.eventService.updateCategory(this.category!.id, request)
      : this.eventService.createCategory(request);

    operation.subscribe({
      next: (category) => {
        this.submitting = false;
        this.dialogRef.close(category);
      },
      error: (error) => {
        console.error('Failed to save category:', error);
        this.submitting = false;
        alert('Failed to save category. Please try again.');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
