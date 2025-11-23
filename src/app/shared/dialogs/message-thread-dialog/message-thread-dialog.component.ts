import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommunicationService } from '../../../core/services/api/communication.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Message } from '../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface MessageThreadDialogData {
  threadId: string;
  subject: string;
}

@Component({
  selector: 'app-message-thread-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.subject}}</h2>
    <mat-dialog-content>
      <div class="messages-container" #messagesContainer>
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && messages.length === 0" class="empty-state">
          <mat-icon>message</mat-icon>
          <p>No messages in this thread</p>
        </div>

        <div *ngFor="let message of messages" class="message-item" 
             [class.own-message]="message.senderId === currentUserId">
          <div class="message-header">
            <strong>{{message.senderName || 'Unknown'}}</strong>
            <span class="message-time">{{formatDate(message.createdAt)}}</span>
          </div>
          <div class="message-content">{{message.content}}</div>
          <div *ngIf="message.attachments && message.attachments.length > 0" class="attachments">
            <div *ngFor="let attachment of message.attachments" class="attachment-item">
              <mat-icon>attach_file</mat-icon>
              <a (click)="downloadAttachment(attachment)" class="attachment-link">
                {{attachment.fileName}}
              </a>
            </div>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Reply Section -->
      <div class="reply-section">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type your reply...</mat-label>
          <textarea matInput [formControl]="replyControl" rows="3"></textarea>
        </mat-form-field>
        
        <div class="reply-actions">
          <button mat-button (click)="fileInput.click()">
            <mat-icon>attach_file</mat-icon>
            Attach
          </button>
          <input #fileInput type="file" multiple (change)="onFileSelected($event)" 
                 accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" style="display: none" />
          
          <button mat-raised-button color="primary" (click)="sendReply()" 
                  [disabled]="!replyControl.value || sending">
            <mat-spinner *ngIf="sending" diameter="20"></mat-spinner>
            <span *ngIf="!sending">Send</span>
          </button>
        </div>

        <div *ngIf="selectedFiles.length > 0" class="selected-files">
          <div *ngFor="let file of selectedFiles" class="file-chip">
            <mat-icon>insert_drive_file</mat-icon>
            <span>{{file.name}}</span>
            <button mat-icon-button (click)="removeFile(file)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 600px;
      max-width: 800px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      padding: 0 !important;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      max-height: 500px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .message-item {
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 8px;
      background-color: #f5f5f5;
      max-width: 80%;
    }

    .message-item.own-message {
      margin-left: auto;
      background-color: #e3f2fd;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .message-time {
      color: #666;
    }

    .message-content {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .attachments {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }

    .attachment-link {
      cursor: pointer;
      color: #1976d2;
      text-decoration: underline;
    }

    .reply-section {
      padding: 20px;
      background-color: #fafafa;
    }

    .full-width {
      width: 100%;
    }

    .reply-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .selected-files {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .file-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background-color: #e0e0e0;
      border-radius: 16px;
      font-size: 12px;
    }

    .file-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class MessageThreadDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  messages: Message[] = [];
  loading = true;
  sending = false;
  currentUserId: string | null = null;
  replyControl = new FormControl('');
  selectedFiles: File[] = [];

  constructor(
    private dialogRef: MatDialogRef<MessageThreadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageThreadDialogData,
    private communicationService: CommunicationService,
    private webSocketService: WebSocketService,
    private snackBar: MatSnackBar
  ) {
    this.currentUserId = localStorage.getItem('user_id');
  }

  ngOnInit(): void {
    this.loadMessages();
    this.subscribeToNewMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMessages(): void {
    this.loading = true;
    this.communicationService.getMessageThread(this.data.threadId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.messages = response.content || [];
          this.loading = false;
          this.markThreadAsRead();
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.snackBar.open('Failed to load messages', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  subscribeToNewMessages(): void {
    this.webSocketService.subscribeToUserQueue(this.currentUserId!, (message: Message) => {
      if (message.threadId === this.data.threadId) {
        this.messages.push(message);
      }
    });
  }

  markThreadAsRead(): void {
    this.communicationService.markThreadAsRead(this.data.threadId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

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

  sendReply(): void {
    if (!this.replyControl.value) return;

    this.sending = true;
    this.communicationService.replyToMessage(
      this.data.threadId,
      this.replyControl.value,
      this.selectedFiles
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.messages.push(message);
          this.replyControl.reset();
          this.selectedFiles = [];
          this.sending = false;
        },
        error: (error) => {
          console.error('Error sending reply:', error);
          this.snackBar.open('Failed to send reply', 'Close', { duration: 3000 });
          this.sending = false;
        }
      });
  }

  downloadAttachment(attachment: any): void {
    this.communicationService.downloadAttachment(attachment.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = attachment.fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading attachment:', error);
          this.snackBar.open('Failed to download attachment', 'Close', { duration: 3000 });
        }
      });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
