import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { NotificationService } from '../../../../core/services/api/notification.service';
import { NotificationSettings, DeviceToken } from '../../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatSnackBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.css'
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  saving = false;
  settings: NotificationSettings[] = [];
  devices: DeviceToken[] = [];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadDevices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSettings(): void {
    this.loading = true;
    this.notificationService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.settings = settings;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load settings', error);
          this.loading = false;
          this.snackBar.open('Failed to load settings', 'Close', { duration: 3000 });
        }
      });
  }

  loadDevices(): void {
    this.notificationService.getUserDevices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (devices) => {
          this.devices = devices;
        },
        error: (error) => {
          console.error('Failed to load devices', error);
        }
      });
  }

  updateSetting(setting: NotificationSettings): void {
    this.saving = true;
    this.notificationService.updateSetting(setting.id!, setting)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Settings updated successfully', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Failed to update setting', error);
          this.saving = false;
          this.snackBar.open('Failed to update settings', 'Close', { duration: 3000 });
        }
      });
  }

  removeDevice(token: string): void {
    this.notificationService.deactivateDevice(token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadDevices();
          this.snackBar.open('Device removed successfully', 'Close', { duration: 2000 });
        },
        error: (error) => {
          console.error('Failed to remove device', error);
          this.snackBar.open('Failed to remove device', 'Close', { duration: 3000 });
        }
      });
  }

  removeAllDevices(): void {
    if (confirm('Are you sure you want to remove all devices?')) {
      this.notificationService.removeAllDevices()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadDevices();
            this.snackBar.open('All devices removed successfully', 'Close', { duration: 2000 });
          },
          error: (error) => {
            console.error('Failed to remove devices', error);
            this.snackBar.open('Failed to remove devices', 'Close', { duration: 3000 });
          }
        });
    }
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.snackBar.open('Notification permission granted', 'Close', { duration: 2000 });
          // TODO: Register FCM token
        } else {
          this.snackBar.open('Notification permission denied', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Push notifications not supported', 'Close', { duration: 3000 });
    }
  }

  getDeviceIcon(deviceType: string): string {
    const icons: { [key: string]: string } = {
      'ANDROID': 'phone_android',
      'IOS': 'phone_iphone',
      'WEB': 'computer'
    };
    return icons[deviceType] || 'devices';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/teacher/notifications']);
  }
}
