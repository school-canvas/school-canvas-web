import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { EventService } from '../../../core/services/api/event.service';
import { CreateEventRequest, EventCategory } from '../../../core/models';

@Component({
  selector: 'app-create-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatChipsModule
  ],
  templateUrl: './create-event-dialog.component.html',
  styleUrl: './create-event-dialog.component.css'
})
export class CreateEventDialogComponent implements OnInit {
  eventForm!: FormGroup;
  categories: EventCategory[];
  submitting = false;

  reminderOptions = [
    { label: '15 minutes before', value: 15 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
    { label: '1 week before', value: 10080 }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { categories: EventCategory[] },
    private dialogRef: MatDialogRef<CreateEventDialogComponent>,
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    this.categories = data.categories;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      categoryId: [''],
      location: ['', Validators.maxLength(255)],
      startDate: [now, Validators.required],
      startTime: [this.formatTimeForInput(now), Validators.required],
      endDate: [oneHourLater, Validators.required],
      endTime: [this.formatTimeForInput(oneHourLater), Validators.required],
      isAllDay: [false],
      isRecurring: [false],
      reminderMinutes: [[15, 60]] // Default reminders
    });

    // Watch for all-day toggle
    this.eventForm.get('isAllDay')?.valueChanges.subscribe(isAllDay => {
      if (isAllDay) {
        this.eventForm.get('startTime')?.disable();
        this.eventForm.get('endTime')?.disable();
      } else {
        this.eventForm.get('startTime')?.enable();
        this.eventForm.get('endTime')?.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    const formValue = this.eventForm.value;
    
    // Combine date and time
    const startDatetime = this.combineDateTime(
      formValue.startDate,
      formValue.isAllDay ? '00:00' : formValue.startTime
    );
    
    const endDatetime = this.combineDateTime(
      formValue.endDate,
      formValue.isAllDay ? '23:59' : formValue.endTime
    );

    const request: CreateEventRequest = {
      title: formValue.title,
      description: formValue.description || undefined,
      categoryId: formValue.categoryId || undefined,
      location: formValue.location || undefined,
      startDatetime: startDatetime,
      endDatetime: endDatetime,
      isAllDay: formValue.isAllDay,
      isRecurring: formValue.isRecurring,
      reminderMinutesBefore: formValue.reminderMinutes || []
    };

    this.submitting = true;
    this.eventService.createEvent(request).subscribe({
      next: (event) => {
        this.submitting = false;
        this.dialogRef.close(event);
      },
      error: (error) => {
        console.error('Failed to create event:', error);
        this.submitting = false;
        alert('Failed to create event. Please try again.');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  combineDateTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
  }

  formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

