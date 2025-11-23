import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommunicationService } from '../../../core/services/api/communication.service';

export interface ComposeMessageDialogData {
  recipientIds?: string[];
  recipientNames?: string[];
  subject?: string;
}

@Component({
  selector: 'app-compose-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Compose Message</h2>
    <mat-dialog-content>
      <form [formGroup]="messageForm">
        <!-- Recipients -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Recipients</mat-label>
          <mat-chip-grid #chipGrid>
            <mat-chip-row *ngFor="let name of recipientNames" (removed)="removeRecipient(name)">
              {{name}}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
          </mat-chip-grid>
          <input placeholder="Add recipients..." disabled />
        </mat-form-field>

        <!-- Subject -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Subject</mat-label>
          <input matInput formControlName="subject" placeholder="Enter message subject" />
          <mat-error *ngIf="messageForm.get('subject')?.hasError('required')">
            Subject is required
          </mat-error>
        </mat-form-field>

        <!-- Message Content -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Message</mat-label>
          <textarea matInput formControlName="content" rows="10" 
                    placeholder="Type your message here..."></textarea>
          <mat-error *ngIf="messageForm.get('content')?.hasError('required')">
            Message content is required
          </mat-error>
        </mat-form-field>

        <!-- File Attachments -->
        <div class="file-upload-section">
          <button mat-stroked-button type="button" (click)="fileInput.click()">
            <mat-icon>attach_file</mat-icon>
            Add Attachments
          </button>
          <input #fileInput type="file" multiple (change)="onFileSelected($event)" 
                 accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" style="display: none" />
          
          <div *ngIf="selectedFiles.length > 0" class="selected-files">
            <mat-chip-row *ngFor="let file of selectedFiles" (removed)="removeFile(file)">
              <mat-icon>insert_drive_file</mat-icon>
              {{file.name}} ({{formatFileSize(file.size)}})
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="sending">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSend()" [disabled]="!messageForm.valid || sending">
        <mat-spinner *ngIf="sending" diameter="20"></mat-spinner>
        <span *ngIf="!sending">Send</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      min-width: 500px;
      max-width: 700px;
    }

    .file-upload-section {
      margin: 16px 0;
    }

    .selected-files {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    mat-chip-row {
      max-width: 300px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class ComposeMessageDialogComponent implements OnInit {
  messageForm: FormGroup;
  selectedFiles: File[] = [];
  sending = false;
  recipientNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ComposeMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComposeMessageDialogData,
    private communicationService: CommunicationService,
    private snackBar: MatSnackBar
  ) {
    this.messageForm = this.fb.group({
      subject: [data?.subject || '', Validators.required],
      content: ['', Validators.required]
    });

    this.recipientNames = data?.recipientNames || [];
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (file.size > maxSize) {
        this.snackBar.open(`File ${file.name} exceeds 10MB limit`, 'Close', { duration: 3000 });
        continue;
      }
      this.selectedFiles.push(file);
    }
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

  removeRecipient(name: string): void {
    const index = this.recipientNames.indexOf(name);
    if (index >= 0) {
      this.recipientNames.splice(index, 1);
      if (this.data.recipientIds) {
        this.data.recipientIds.splice(index, 1);
      }
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSend(): void {
    if (!this.messageForm.valid || !this.data.recipientIds || this.data.recipientIds.length === 0) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.sending = true;

    const request = {
      recipientIds: this.data.recipientIds,
      subject: this.messageForm.value.subject,
      content: this.messageForm.value.content,
      attachments: this.selectedFiles
    };

    this.communicationService.sendMessage(request).subscribe({
      next: (message) => {
        this.snackBar.open('Message sent successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(message);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.snackBar.open('Failed to send message', 'Close', { duration: 3000 });
        this.sending = false;
      }
    });
  }
}
