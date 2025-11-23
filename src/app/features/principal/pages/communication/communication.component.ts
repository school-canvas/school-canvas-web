import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ComposeMessageDialogComponent } from '../../../../shared/dialogs/compose-message-dialog/compose-message-dialog.component';
import { MessageThreadDialogComponent } from '../../../../shared/dialogs/message-thread-dialog/message-thread-dialog.component';

import { CommunicationService } from '../../../../core/services/api/communication.service';
import { TeacherService } from '../../../../core/services/api/teacher.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { AuthFacade } from '../../../auth/state/auth.facade';
import { Message, Announcement, Teacher, MessageThread } from '../../../../core/models';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-communication',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDialogModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.css'
})
export class CommunicationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  currentUserId: string | null = null;
  
  // Messages/Threads Data
  messageThreads: MessageThread[] = [];
  unreadCount = 0;
  
  // Announcements Data
  announcements: Announcement[] = [];
  
  // Teachers Data
  teachers: Teacher[] = [];

  constructor(
    private router: Router,
    private communicationService: CommunicationService,
    private teacherService: TeacherService,
    private webSocketService: WebSocketService,
    private authFacade: AuthFacade,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authFacade.user$.pipe(takeUntil(this.destroy$)).subscribe((user: any) => {
      this.currentUserId = user?.sub || null;
      if (this.currentUserId) {
        this.loadCommunicationData();
        this.connectWebSocket();
      }
    });
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  connectWebSocket(): void {
    if (this.currentUserId) {
      this.webSocketService.connect(this.currentUserId);
      this.webSocketService.subscribeToUserQueue(this.currentUserId, (message) => {
        this.loadCommunicationData(); // Refresh when new message arrives
        this.snackBar.open('New message received', 'View', { duration: 3000 });
      });
    }
  }

  loadCommunicationData(): void {
    if (!this.currentUserId) return;

    this.loading = true;

    forkJoin({
      threads: this.communicationService.getUserThreads(0, 50),
      announcements: this.communicationService.getAllAnnouncements(0, 20),
      teachers: this.teacherService.getAllTeachers(0, 100)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          const threadsResponse: any = results.threads;
          const announcementsResponse: any = results.announcements;
          const teachersResponse: any = results.teachers;
          
          this.messageThreads = threadsResponse.content || [];
          this.announcements = announcementsResponse.content || [];
          this.teachers = teachersResponse.content || [];
          
          this.unreadCount = this.messageThreads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading communication data:', error);
          this.snackBar.open('Failed to load communication data', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
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

  getAnnouncementPriorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  }

  composeMessage(teacher?: Teacher): void {
    const dialogRef = this.dialog.open(ComposeMessageDialogComponent, {
      width: '700px',
      data: {
        recipientIds: teacher ? [teacher.id] : [],
        recipientNames: teacher ? [`${teacher.firstName} ${teacher.lastName}`] : [],
        subject: teacher ? `Message to ${teacher.firstName} ${teacher.lastName}` : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCommunicationData();
      }
    });
  }

  viewMessageThread(thread: MessageThread): void {
    const dialogRef = this.dialog.open(MessageThreadDialogComponent, {
      width: '800px',
      height: '600px',
      data: {
        threadId: thread.id,
        subject: thread.subject
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadCommunicationData();
    });
  }

  viewMessage(message: Message): void {
    // Navigate to thread view
    if (message.threadId) {
      this.viewMessageThread({ id: message.threadId, subject: 'Message Thread' } as MessageThread);
    }
  }

  viewAnnouncement(announcement: Announcement): void {
    // TODO: Open announcement detail dialog
    this.snackBar.open('View Announcement Details - Feature needed', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/principal/dashboard']);
  }
}
