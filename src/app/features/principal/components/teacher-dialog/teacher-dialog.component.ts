import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TeacherService } from '../../../../core/services/api/teacher.service';
import { Teacher, CreateTeacherRequest, UpdateTeacherRequest } from '../../../../core/models/teacher.model';

export interface TeacherDialogData {
  teacher?: Teacher;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-teacher-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './teacher-dialog.component.html',
  styleUrl: './teacher-dialog.component.css'
})
export class TeacherDialogComponent implements OnInit {
  teacherForm!: FormGroup;
  loading = false;
  isEditMode = false;
  
  departments = [
    'Mathematics', 'Science', 'English', 'Social Studies', 'Physical Education',
    'Arts', 'Music', 'Computer Science', 'Languages', 'Special Education'
  ];
  
  designations = [
    'Teacher', 'Senior Teacher', 'Head of Department', 'Vice Principal',
    'Principal', 'Assistant Teacher', 'Subject Coordinator'
  ];
  
  statusOptions = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED'];

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private dialogRef: MatDialogRef<TeacherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TeacherDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initializeForm();
    if (this.isEditMode && this.data.teacher) {
      this.populateForm(this.data.teacher);
    }
  }

  initializeForm(): void {
    this.teacherForm = this.fb.group({
      userId: ['', Validators.required],
      employeeId: ['', Validators.required],
      firstName: [{ value: '', disabled: this.isEditMode }, Validators.required],
      lastName: [{ value: '', disabled: this.isEditMode }, Validators.required],
      email: [{ value: '', disabled: this.isEditMode }, [Validators.required, Validators.email]],
      phoneNumber: [''],
      department: [''],
      qualification: [''],
      experience: [0, [Validators.min(0)]],
      specialization: [''],
      joiningDate: [new Date()],
      designation: [''],
      status: ['ACTIVE', Validators.required]
    });
  }

  populateForm(teacher: Teacher): void {
    this.teacherForm.patchValue({
      userId: teacher.userId,
      employeeId: teacher.employeeId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phoneNumber: teacher.phoneNumber,
      department: teacher.department,
      qualification: teacher.qualification,
      experience: teacher.experience,
      specialization: teacher.specialization,
      joiningDate: teacher.joiningDate,
      designation: teacher.designation,
      status: teacher.status
    });
  }

  onSubmit(): void {
    if (!this.teacherForm.valid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateTeacher();
    } else {
      this.createTeacher();
    }
  }

  createTeacher(): void {
    const formValue = this.teacherForm.getRawValue();
    
    const request: CreateTeacherRequest = {
      userId: formValue.userId,
      employeeId: formValue.employeeId,
      department: formValue.department,
      qualification: formValue.qualification,
      experience: formValue.experience,
      specialization: formValue.specialization,
      joiningDate: formValue.joiningDate,
      designation: formValue.designation
    };

    this.teacherService.createTeacher(request).subscribe({
      next: (teacher) => {
        this.loading = false;
        this.dialogRef.close(teacher);
      },
      error: (error) => {
        console.error('Error creating teacher:', error);
        this.loading = false;
      }
    });
  }

  updateTeacher(): void {
    if (!this.data.teacher) return;

    const formValue = this.teacherForm.value;
    
    const request: UpdateTeacherRequest = {
      employeeId: formValue.employeeId,
      department: formValue.department,
      qualification: formValue.qualification,
      experience: formValue.experience,
      specialization: formValue.specialization,
      joiningDate: formValue.joiningDate,
      designation: formValue.designation,
      status: formValue.status
    };

    this.teacherService.updateTeacher(this.data.teacher.userId, request).subscribe({
      next: (teacher) => {
        this.loading = false;
        this.dialogRef.close(teacher);
      },
      error: (error) => {
        console.error('Error updating teacher:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
