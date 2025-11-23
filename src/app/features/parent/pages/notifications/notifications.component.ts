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
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { NotificationService } from '../../../../core/services/api/notification.service';
import { Notification } from '../../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatBadgeModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatCheckboxModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  
  // Filters
  filterType: string = 'all';
  filterStatus: string = 'all';
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalItems = 0;
  hasMore = true;

  // Selection
  selectedNotifications = new Set<string>();

  notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'SYSTEM', label: 'System' },
    { value: 'ACADEMIC', label: 'Academic' },
    { value: 'ATTENDANCE', label: 'Attendance' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'EVENT', label: 'Event' },
    { value: 'ANNOUNCEMENT', label: 'Announcement' }
  ];

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getUserNotifications(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.notifications = response.content;
          this.totalItems = response.totalElements;
          this.hasMore = !response.last;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load notifications', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.notifications];

    if (this.filterType !== 'all') {
      filtered = filtered.filter(n => n.notificationType === this.filterType);
    }

    if (this.filterStatus === 'unread') {
      filtered = filtered.filter(n => n.deliveryStatus !== 'READ');
    } else if (this.filterStatus === 'read') {
      filtered = filtered.filter(n => n.deliveryStatus === 'READ');
    }

    this.filteredNotifications = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  markAsRead(notification: Notification): void {
    if (notification.deliveryStatus === 'READ') return;
    
    this.notificationService.markAsRead(notification.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notification.deliveryStatus = 'READ';
          this.applyFilters();
        },
        error: (error) => console.error('Failed to mark as read', error)
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => console.error('Failed to mark all as read', error)
      });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => console.error('Failed to delete notification', error)
      });
  }

  toggleSelection(notificationId: string): void {
    if (this.selectedNotifications.has(notificationId)) {
      this.selectedNotifications.delete(notificationId);
    } else {
      this.selectedNotifications.add(notificationId);
    }
  }

  isSelected(notificationId: string): boolean {
    return this.selectedNotifications.has(notificationId);
  }

  deleteSelected(): void {
    const deletePromises = Array.from(this.selectedNotifications).map(id =>
      this.notificationService.deleteNotification(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.selectedNotifications.clear();
      this.loadNotifications();
    }).catch(error => console.error('Failed to delete notifications', error));
  }

  loadMore(): void {
    if (this.hasMore) {
      this.currentPage++;
      this.loadNotifications();
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'SYSTEM': 'settings',
      'ACADEMIC': 'school',
      'ATTENDANCE': 'event_available',
      'FINANCIAL': 'payment',
      'EVENT': 'event',
      'ANNOUNCEMENT': 'campaign'
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      'SYSTEM': 'primary',
      'ACADEMIC': 'accent',
      'ATTENDANCE': 'warn',
      'FINANCIAL': 'primary',
      'EVENT': 'accent',
      'ANNOUNCEMENT': 'warn'
    };
    return colors[type] || 'primary';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  goToSettings(): void {
    this.router.navigate(['/parent/notification-settings']);
  }

  goBack(): void {
    this.router.navigate(['/parent/dashboard']);
  }
}
