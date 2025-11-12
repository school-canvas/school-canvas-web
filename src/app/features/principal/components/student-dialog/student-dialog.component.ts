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
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StudentService } from '../../../../core/services/api/student.service';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '../../../../core/models/student.model';

export interface StudentDialogData {
  student?: Student;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-student-dialog',
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
    MatStepperModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './student-dialog.component.html',
  styleUrl: './student-dialog.component.css'
})
export class StudentDialogComponent implements OnInit {
  studentForm!: FormGroup;
  addressForm!: FormGroup;
  emergencyForm!: FormGroup;
  guardianForm!: FormGroup;
  
  loading = false;
  isEditMode = false;
  
  gradeLevels = [
    'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];
  
  statusOptions = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private dialogRef: MatDialogRef<StudentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initializeForms();
    if (this.isEditMode && this.data.student) {
      this.populateForms(this.data.student);
    }
  }

  initializeForms(): void {
    // Basic Student Information
    this.studentForm = this.fb.group({
      userId: ['', Validators.required],
      studentId: [''],
      firstName: [{ value: '', disabled: this.isEditMode }, Validators.required],
      lastName: [{ value: '', disabled: this.isEditMode }, Validators.required],
      email: [{ value: '', disabled: this.isEditMode }, [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      enrollmentDate: [new Date()],
      phoneNumber: [''],
      status: ['ACTIVE', Validators.required]
    });

    // Address Information
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required]
    });

    // Emergency Contact
    this.emergencyForm = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email]
    });

    // Guardian Information
    this.guardianForm = this.fb.group({
      fatherName: [''],
      fatherOccupation: [''],
      fatherPhone: [''],
      fatherEmail: ['', Validators.email],
      motherName: [''],
      motherOccupation: [''],
      motherPhone: [''],
      motherEmail: ['', Validators.email],
      legalGuardianName: [''],
      legalGuardianPhone: [''],
      legalGuardianEmail: ['', Validators.email],
      legalGuardianRelationship: ['']
    });
  }

  populateForms(student: Student): void {
    // Populate basic info
    this.studentForm.patchValue({
      userId: student.userId,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      dateOfBirth: student.dateOfBirth,
      gradeLevel: student.gradeLevel,
      enrollmentDate: student.enrollmentDate,
      phoneNumber: student.phoneNumber,
      status: student.status
    });

    // Populate address
    if (student.address) {
      this.addressForm.patchValue(student.address);
    }

    // Populate emergency contact
    if (student.emergencyContact) {
      this.emergencyForm.patchValue(student.emergencyContact);
    }

    // Populate guardian info
    if (student.guardianInformation) {
      this.guardianForm.patchValue(student.guardianInformation);
    }
  }

  onSubmit(): void {
    if (!this.studentForm.valid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateStudent();
    } else {
      this.createStudent();
    }
  }

  createStudent(): void {
    const request: CreateStudentRequest = {
      userId: this.studentForm.value.userId,
      studentId: this.studentForm.value.studentId,
      dateOfBirth: this.studentForm.value.dateOfBirth,
      gradeLevel: this.studentForm.value.gradeLevel,
      enrollmentDate: this.studentForm.value.enrollmentDate,
      phoneNumber: this.studentForm.value.phoneNumber,
      address: this.addressForm.valid ? this.addressForm.value : undefined,
      emergencyContact: this.emergencyForm.valid ? this.emergencyForm.value : undefined,
      guardianInformation: this.guardianForm.value
    };

    this.studentService.createStudent(request).subscribe({
      next: (student) => {
        this.loading = false;
        this.dialogRef.close(student);
      },
      error: (error) => {
        console.error('Error creating student:', error);
        this.loading = false;
      }
    });
  }

  updateStudent(): void {
    if (!this.data.student) return;

    const request: UpdateStudentRequest = {
      dateOfBirth: this.studentForm.value.dateOfBirth,
      gradeLevel: this.studentForm.value.gradeLevel,
      phoneNumber: this.studentForm.value.phoneNumber,
      status: this.studentForm.value.status,
      address: this.addressForm.valid ? this.addressForm.value : undefined,
      emergencyContact: this.emergencyForm.valid ? this.emergencyForm.value : undefined,
      guardianInformation: this.guardianForm.value
    };

    this.studentService.updateStudent(this.data.student.userId, request).subscribe({
      next: (student) => {
        this.loading = false;
        this.dialogRef.close(student);
      },
      error: (error) => {
        console.error('Error updating student:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
