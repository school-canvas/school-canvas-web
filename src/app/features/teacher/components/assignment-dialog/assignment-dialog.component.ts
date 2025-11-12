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

import { Assessment, AssessmentStatus, AssessmentType, CreateAssessmentRequest } from '../../../../core/models/assessment.model';
import { ClassDTO } from '../../../../core/models/class.model';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { ClassService } from '../../../../core/services/api/class.service';

export interface AssignmentDialogData {
  assessment?: Assessment;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-assignment-dialog',
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
  templateUrl: './assignment-dialog.component.html',
  styleUrl: './assignment-dialog.component.css'
})
export class AssignmentDialogComponent implements OnInit {
  assignmentForm!: FormGroup;
  loading = false;
  isEditMode = false;
  classes: ClassDTO[] = [];
  loadingData = true;
  minDate = new Date();

  // Predefined assessment types
  assessmentTypes = [
    { id: '1', name: 'Homework', description: 'Regular homework assignments' },
    { id: '2', name: 'Quiz', description: 'Short assessments' },
    { id: '3', name: 'Test', description: 'Chapter or unit tests' },
    { id: '4', name: 'Midterm Exam', description: 'Mid-semester examination' },
    { id: '5', name: 'Final Exam', description: 'End of semester examination' },
    { id: '6', name: 'Project', description: 'Long-term projects' },
    { id: '7', name: 'Lab Work', description: 'Laboratory assignments' },
    { id: '8', name: 'Presentation', description: 'Oral presentations' }
  ];

  statusOptions = Object.values(AssessmentStatus);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AssignmentDialogComponent>,
    private assessmentService: AssessmentService,
    private classService: ClassService,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();

    if (this.isEditMode && this.data.assessment) {
      this.populateForm(this.data.assessment);
    }
  }

  private initializeForm(): void {
    this.assignmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      classId: ['', Validators.required],
      assessmentTypeId: ['', Validators.required],
      totalMarks: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
      passingMarks: [40, [Validators.min(0)]],
      dueDate: ['', Validators.required],
      instructions: [''],
      attachmentUrl: [''],
      status: [AssessmentStatus.DRAFT]
    });
  }

  private loadData(): void {
    this.loadingData = true;
    
    this.classService.getAllClasses().subscribe({
      next: (response) => {
        this.classes = response.content;
        this.loadingData = false;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.loadingData = false;
      }
    });
  }

  private populateForm(assessment: Assessment): void {
    this.assignmentForm.patchValue({
      title: assessment.title,
      description: assessment.description || '',
      classId: assessment.classId,
      assessmentTypeId: assessment.assessmentTypeId,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks || 0,
      dueDate: new Date(assessment.dueDate),
      instructions: assessment.instructions || '',
      attachmentUrl: assessment.attachmentUrl || '',
      status: assessment.status
    });
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateAssignment();
    } else {
      this.createAssignment();
    }
  }

  private createAssignment(): void {
    const formValue = this.assignmentForm.value;
    const request: CreateAssessmentRequest = {
      title: formValue.title,
      description: formValue.description,
      classId: formValue.classId,
      assessmentTypeId: formValue.assessmentTypeId,
      totalMarks: formValue.totalMarks,
      passingMarks: formValue.passingMarks,
      dueDate: this.formatDate(formValue.dueDate),
      instructions: formValue.instructions,
      attachmentUrl: formValue.attachmentUrl
    };

    this.assessmentService.createAssessment(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error creating assignment:', error);
        this.loading = false;
      }
    });
  }

  private updateAssignment(): void {
    if (!this.data.assessment) return;

    const formValue = this.assignmentForm.value;
    const request: CreateAssessmentRequest & { status?: AssessmentStatus } = {
      title: formValue.title,
      description: formValue.description,
      classId: formValue.classId,
      assessmentTypeId: formValue.assessmentTypeId,
      totalMarks: formValue.totalMarks,
      passingMarks: formValue.passingMarks,
      dueDate: this.formatDate(formValue.dueDate),
      instructions: formValue.instructions,
      attachmentUrl: formValue.attachmentUrl,
      status: formValue.status
    };

    this.assessmentService.updateAssessment(this.data.assessment.id, request).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error updating assignment:', error);
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
    return this.assignmentForm.valid && !this.loading && !this.loadingData;
  }

  getStatusLabel(status: AssessmentStatus): string {
    return status.replace('_', ' ');
  }
}
