import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Announcement } from '../../../core/models';

@Component({
  selector: 'app-announcement-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './announcement-detail-dialog.component.html',
  styleUrl: './announcement-detail-dialog.component.css'
})
export class AnnouncementDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AnnouncementDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public announcement: Announcement
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'HIGH': 'warn',
      'MEDIUM': 'accent',
      'LOW': 'primary'
    };
    return colors[priority] || 'primary';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
