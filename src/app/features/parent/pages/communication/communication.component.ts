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

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { CommunicationService } from '../../../../core/services/api/communication.service';
import { TeacherService } from '../../../../core/services/api/teacher.service';
import { AuthFacade } from '../../../auth/state/auth.facade';
import { Message, Announcement, Teacher } from '../../../../core/models';
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
  
  // Messages Data
  messages: Message[] = [];
  unreadCount = 0;
  
  // Announcements Data
  announcements: Announcement[] = [];
  
  // Teachers Data
  teachers: Teacher[] = [];

  constructor(
    private router: Router,
    private communicationService: CommunicationService,
    private teacherService: TeacherService,
    private authFacade: AuthFacade,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authFacade.user$.pipe(takeUntil(this.destroy$)).subscribe((user: any) => {
      this.currentUserId = user?.sub || null;
      if (this.currentUserId) {
        this.loadCommunicationData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCommunicationData(): void {
    if (!this.currentUserId) return;

    this.loading = true;

    forkJoin({
      messages: this.communicationService.getMessagesByUser(this.currentUserId, 0, 50),
      announcements: this.communicationService.getAnnouncementsByRole('PARENT', 0, 20),
      teachers: this.teacherService.getAllTeachers(0, 100)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          const messagesResponse: any = results.messages;
          const announcementsResponse: any = results.announcements;
          const teachersResponse: any = results.teachers;
          
          this.messages = messagesResponse.content || [];
          this.announcements = announcementsResponse.content || [];
          this.teachers = teachersResponse.content || [];
          
          this.unreadCount = this.messages.filter(m => !m.isRead).length;
          
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
    // TODO: Open compose message dialog
    if (teacher) {
      this.snackBar.open(`Compose message to ${teacher.firstName} ${teacher.lastName} - Feature needed`, 'Close', { duration: 3000 });
    } else {
      this.snackBar.open('Compose new message - Feature needed', 'Close', { duration: 3000 });
    }
  }

  viewMessage(message: Message): void {
    // TODO: Open message thread dialog or navigate to message detail
    this.snackBar.open('View Message Thread - Feature needed', 'Close', { duration: 3000 });
    
    // Mark as read if unread
    if (!message.isRead && message.id) {
      this.communicationService.markMessageAsRead(message.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          message.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        });
    }
  }

  viewAnnouncement(announcement: Announcement): void {
    // TODO: Open announcement detail dialog
    this.snackBar.open('View Announcement Details - Feature needed', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/parent/dashboard']);
  }
}
