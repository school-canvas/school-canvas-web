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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClassDTO, CreateClassRequest } from '../../../../core/models/class.model';
import { Teacher } from '../../../../core/models/teacher.model';
import { ClassService } from '../../../../core/services/api/class.service';
import { TeacherService } from '../../../../core/services/api/teacher.service';

export interface ClassDialogData {
  class?: ClassDTO;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-class-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './class-dialog.component.html',
  styleUrl: './class-dialog.component.css'
})
export class ClassDialogComponent implements OnInit {
  classForm!: FormGroup;
  loading = false;
  isEditMode = false;
  teachers: Teacher[] = [];
  loadingTeachers = true;

  gradeLevels = [
    'Pre-K',
    'Kindergarten',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12'
  ];

  subjects = [
    'Mathematics',
    'Science',
    'English',
    'Social Studies',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music',
    'Foreign Language'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClassDialogComponent>,
    private classService: ClassService,
    private teacherService: TeacherService,
    @Inject(MAT_DIALOG_DATA) public data: ClassDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadTeachers();

    if (this.isEditMode && this.data.class) {
      this.populateForm(this.data.class);
    }
  }

  private initializeForm(): void {
    this.classForm = this.fb.group({
      className: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      teacherId: ['', Validators.required],
      description: [''],
      maxCapacity: [30, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  private loadTeachers(): void {
    this.loadingTeachers = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (response) => {
        this.teachers = response.content.filter((t: Teacher) => t.status === 'ACTIVE');
        this.loadingTeachers = false;
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        this.loadingTeachers = false;
      }
    });
  }

  private populateForm(classData: ClassDTO): void {
    this.classForm.patchValue({
      className: classData.className,
      subject: classData.subject,
      gradeLevel: classData.gradeLevel,
      teacherId: classData.teacherId,
      description: classData.description || '',
      maxCapacity: classData.maxCapacity || 30
    });
  }

  onSubmit(): void {
    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateClass();
    } else {
      this.createClass();
    }
  }

  private createClass(): void {
    const request: CreateClassRequest = {
      className: this.classForm.value.className,
      subject: this.classForm.value.subject,
      gradeLevel: this.classForm.value.gradeLevel,
      teacherId: this.classForm.value.teacherId,
      description: this.classForm.value.description,
      maxCapacity: this.classForm.value.maxCapacity
    };

    this.classService.createClass(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error creating class:', error);
        this.loading = false;
      }
    });
  }

  private updateClass(): void {
    if (!this.data.class) return;

    const request: CreateClassRequest = {
      className: this.classForm.value.className,
      subject: this.classForm.value.subject,
      gradeLevel: this.classForm.value.gradeLevel,
      teacherId: this.classForm.value.teacherId,
      description: this.classForm.value.description,
      maxCapacity: this.classForm.value.maxCapacity
    };

    this.classService.updateClass(this.data.class.id, request).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error updating class:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get isFormValid(): boolean {
    return this.classForm.valid && !this.loading && !this.loadingTeachers;
  }
}
