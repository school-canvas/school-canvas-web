import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { AssessmentService } from '../../../../core/services/api/assessment.service';
import { ClassService } from '../../../../core/services/api/class.service';

type AssignmentType = 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT';
type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  classId: string;
  className: string;
  subject: string;
  totalPoints: number;
  dueDate: string;
  publishDate?: string;
  status: AssignmentStatus;
  submissions: number;
  graded: number;
  createdAt: string;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

@Component({
  selector: 'app-manage-assignments',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatCheckboxModule,
    MatDividerModule,
    PageHeaderComponent,
    StatsCardComponent
  ],
  templateUrl: './manage-assignments.component.html',
  styleUrl: './manage-assignments.component.css'
})
export class ManageAssignmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  classes: ClassOption[] = [];
  
  // Filters
  searchQuery = '';
  filterType: string = 'all';
  filterStatus: string = 'all';
  filterClass: string = 'all';
  
  // Assignment types and statuses
  assignmentTypes: AssignmentType[] = ['HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT'];
  assignmentStatuses: AssignmentStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED'];
  
  // Table columns
  displayedColumns: string[] = ['title', 'class', 'type', 'dueDate', 'submissions', 'status', 'actions'];
  
  // Create/Edit form
  showForm = false;
  isEditMode = false;
  assignmentForm: FormGroup;
  editingAssignment: Assignment | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private assessmentService: AssessmentService,
    private classService: ClassService
  ) {
    this.assignmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      type: ['HOMEWORK', Validators.required],
      classId: ['', Validators.required],
      subject: ['', Validators.required],
      totalPoints: [100, [Validators.required, Validators.min(1)]],
      dueDate: ['', Validators.required],
      publishDate: [''],
      status: ['DRAFT', Validators.required]
    });
  }

  loadData(): void {
    this.loading = true;

    // Mock data - replace with actual API calls
    setTimeout(() => {
      this.classes = this.generateMockClasses();
      this.assignments = this.generateMockAssignments();
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  generateMockClasses(): ClassOption[] {
    return [
      { id: 'class-1', name: 'Grade 10 Mathematics', section: 'A' },
      { id: 'class-2', name: 'Grade 10 Science', section: 'B' },
      { id: 'class-3', name: 'Grade 9 English', section: 'C' },
      { id: 'class-4', name: 'Grade 11 Physics', section: 'A' }
    ];
  }

  generateMockAssignments(): Assignment[] {
    const assignments: Assignment[] = [];
    const types: AssignmentType[] = ['HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT'];
    const statuses: AssignmentStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED'];
    
    for (let i = 1; i <= 20; i++) {
      const type = types[(i - 1) % types.length];
      const status = statuses[i % 3];
      const classOption = this.classes[i % this.classes.length];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i * 2));
      
      assignments.push({
        id: `assignment-${i}`,
        title: `${type} ${Math.ceil(i / 4)}: ${['Algebra', 'Geometry', 'Physics', 'Chemistry', 'Biology'][i % 5]}`,
        description: `This is a ${type.toLowerCase()} assignment covering important topics.`,
        type,
        classId: classOption.id,
        className: `${classOption.name} - ${classOption.section}`,
        subject: ['Mathematics', 'Science', 'English', 'Physics'][i % 4],
        totalPoints: type === 'EXAM' ? 100 : type === 'PROJECT' ? 50 : 20,
        dueDate: dueDate.toISOString(),
        publishDate: status !== 'DRAFT' ? new Date().toISOString() : undefined,
        status,
        submissions: status === 'PUBLISHED' ? 18 + Math.floor(Math.random() * 7) : 0,
        graded: status === 'CLOSED' ? 20 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - i * 86400000).toISOString()
      });
    }
    
    return assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Filtering
  applyFilters(): void {
    this.filteredAssignments = this.assignments.filter(assignment => {
      const matchesSearch = !this.searchQuery || 
        assignment.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        assignment.className.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesType = this.filterType === 'all' || assignment.type === this.filterType;
      const matchesStatus = this.filterStatus === 'all' || assignment.status === this.filterStatus;
      const matchesClass = this.filterClass === 'all' || assignment.classId === this.filterClass;
      
      return matchesSearch && matchesType && matchesStatus && matchesClass;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterType = 'all';
    this.filterStatus = 'all';
    this.filterClass = 'all';
    this.applyFilters();
  }

  // CRUD Operations
  openCreateForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.editingAssignment = null;
    this.assignmentForm.reset({
      type: 'HOMEWORK',
      status: 'DRAFT',
      totalPoints: 100
    });
  }

  openEditForm(assignment: Assignment): void {
    this.showForm = true;
    this.isEditMode = true;
    this.editingAssignment = assignment;
    
    this.assignmentForm.patchValue({
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      classId: assignment.classId,
      subject: assignment.subject,
      totalPoints: assignment.totalPoints,
      dueDate: new Date(assignment.dueDate),
      publishDate: assignment.publishDate ? new Date(assignment.publishDate) : null,
      status: assignment.status
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingAssignment = null;
    this.assignmentForm.reset();
  }

  saveAssignment(): void {
    if (this.assignmentForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.assignmentForm.value;
    
    if (this.isEditMode && this.editingAssignment) {
      // Update existing assignment
      const index = this.assignments.findIndex(a => a.id === this.editingAssignment!.id);
      if (index !== -1) {
        const selectedClass = this.classes.find(c => c.id === formValue.classId);
        this.assignments[index] = {
          ...this.editingAssignment,
          ...formValue,
          className: selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : this.editingAssignment.className,
          dueDate: formValue.dueDate.toISOString(),
          publishDate: formValue.publishDate ? formValue.publishDate.toISOString() : undefined
        };
        this.snackBar.open('Assignment updated successfully!', 'Close', { duration: 3000 });
      }
    } else {
      // Create new assignment
      const selectedClass = this.classes.find(c => c.id === formValue.classId);
      const newAssignment: Assignment = {
        id: `assignment-${Date.now()}`,
        ...formValue,
        className: selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : 'Unknown Class',
        dueDate: formValue.dueDate.toISOString(),
        publishDate: formValue.publishDate ? formValue.publishDate.toISOString() : undefined,
        submissions: 0,
        graded: 0,
        createdAt: new Date().toISOString()
      };
      this.assignments.unshift(newAssignment);
      this.snackBar.open('Assignment created successfully!', 'Close', { duration: 3000 });
    }

    this.applyFilters();
    this.closeForm();
  }

  deleteAssignment(assignment: Assignment): void {
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      const index = this.assignments.findIndex(a => a.id === assignment.id);
      if (index !== -1) {
        this.assignments.splice(index, 1);
        this.applyFilters();
        this.snackBar.open('Assignment deleted successfully!', 'Close', { duration: 3000 });
      }
    }
  }

  publishAssignment(assignment: Assignment): void {
    const index = this.assignments.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
      this.assignments[index].status = 'PUBLISHED';
      this.assignments[index].publishDate = new Date().toISOString();
      this.applyFilters();
      this.snackBar.open('Assignment published successfully!', 'Close', { duration: 3000 });
    }
  }

  closeAssignment(assignment: Assignment): void {
    const index = this.assignments.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
      this.assignments[index].status = 'CLOSED';
      this.applyFilters();
      this.snackBar.open('Assignment closed!', 'Close', { duration: 3000 });
    }
  }

  duplicateAssignment(assignment: Assignment): void {
    const duplicate: Assignment = {
      ...assignment,
      id: `assignment-${Date.now()}`,
      title: `${assignment.title} (Copy)`,
      status: 'DRAFT',
      submissions: 0,
      graded: 0,
      publishDate: undefined,
      createdAt: new Date().toISOString()
    };
    this.assignments.unshift(duplicate);
    this.applyFilters();
    this.snackBar.open('Assignment duplicated!', 'Close', { duration: 3000 });
  }

  // Navigation
  viewSubmissions(assignment: Assignment): void {
    this.router.navigate(['/teacher/assignments', assignment.id, 'submissions']);
  }

  gradeAssignment(assignment: Assignment): void {
    this.router.navigate(['/teacher/assignments', assignment.id, 'grade']);
  }

  // Statistics
  getStatistics() {
    return {
      total: this.assignments.length,
      published: this.assignments.filter(a => a.status === 'PUBLISHED').length,
      draft: this.assignments.filter(a => a.status === 'DRAFT').length,
      closed: this.assignments.filter(a => a.status === 'CLOSED').length
    };
  }

  // Utility methods
  getTypeClass(type: AssignmentType): string {
    const typeMap: { [key: string]: string } = {
      'HOMEWORK': 'type-homework',
      'QUIZ': 'type-quiz',
      'EXAM': 'type-exam',
      'PROJECT': 'type-project'
    };
    return typeMap[type] || '';
  }

  getStatusClass(status: AssignmentStatus): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'status-draft',
      'PUBLISHED': 'status-published',
      'CLOSED': 'status-closed'
    };
    return statusMap[status] || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
