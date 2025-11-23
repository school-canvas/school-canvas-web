import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService as ApiNotificationService } from '../../../core/services/api/notification.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Router } from '@angular/router';
import { appConfig } from '../../../app.config';
import { ApplicationConfig } from '../../../../application-config';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../features/auth/state/auth.selectors';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { User } from '../../../core/models/user.model';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, MaterialModule, MatMenuModule, MatBadgeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  appConfig = ApplicationConfig;
  isLoggedIn = false;
  userRole = '';
  user$: Observable<User | null>;
  currentUser: User | null = null;
  
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    private authService: AuthService, 
    private notificationService: ApiNotificationService,
    private webSocketService: WebSocketService,
    private router: Router,
    private store: Store
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.loadNotifications();
        this.setupWebSocket();
      }
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });

    this.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupWebSocket(): void {
    if (this.currentUser?.id) {
      this.webSocketService.connect(this.currentUser.id);
      this.webSocketService.subscribeToUserQueue(this.currentUser.id, () => {
        this.loadNotifications();
      });
    }
  }

  loadNotifications(): void {
    this.notificationService.getUnreadNotifications(0, 5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notifications = response.content || [];
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });

    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          this.unreadCount = count;
        },
        error: (error) => {
          console.error('Error loading unread count:', error);
        }
      });
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
        }
      });
  }

  viewAllNotifications(): void {
    // Navigate based on user role
    const roleRoutes: Record<string, string> = {
      [this.appConfig.roles.STUDENT]: '/student/notifications',
      [this.appConfig.roles.TEACHER]: '/teacher/notifications',
      [this.appConfig.roles.PARENT]: '/parent/notifications',
      [this.appConfig.roles.PRINCIPAL]: '/principal/notifications'
    };
    
    const route = roleRoutes[this.userRole];
    if (route) {
      this.router.navigate([route]);
    }
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'ASSESSMENT': 'assignment',
      'ATTENDANCE': 'event_available',
      'GRADE': 'grade',
      'MESSAGE': 'message',
      'ANNOUNCEMENT': 'campaign',
      'PAYMENT': 'payment',
      'EVENT': 'event',
      'LIBRARY': 'library_books',
      'SYSTEM': 'info',
      'GENERAL': 'notifications'
    };
    return icons[type] || 'notifications';
  }

  formatNotificationTime(date: string | undefined): string {
    if (!date) return '';
    const notifDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getUserName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  getUserInitials(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  getRoleName(): string {
    switch (this.userRole) {
      case this.appConfig.roles.PRINCIPAL:
        return 'Principal';
      case this.appConfig.roles.TEACHER:
        return 'Teacher';
      case this.appConfig.roles.STUDENT:
        return 'Student';
      case this.appConfig.roles.PARENT:
        return 'Parent';
      default:
        return 'User';
    }
  }
}
