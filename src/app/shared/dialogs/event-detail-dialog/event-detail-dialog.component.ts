import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventService } from '../../../core/services/api/event.service';
import { Event, EventParticipant, ParticipationStatus } from '../../../core/models';

@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './event-detail-dialog.component.html',
  styleUrl: './event-detail-dialog.component.css'
})
export class EventDetailDialogComponent implements OnInit {
  event: Event;
  participants: EventParticipant[] = [];
  loadingParticipants = false;
  respondingToInvite = false;

  ParticipationStatus = ParticipationStatus;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { event: Event },
    private dialogRef: MatDialogRef<EventDetailDialogComponent>,
    private eventService: EventService
  ) {
    this.event = data.event;
  }

  ngOnInit(): void {
    this.loadParticipants();
  }

  loadParticipants(): void {
    this.loadingParticipants = true;
    this.eventService.getEventParticipants(this.event.id).subscribe({
      next: (participants) => {
        this.participants = participants;
        this.loadingParticipants = false;
      },
      error: (error) => {
        console.error('Failed to load participants:', error);
        this.loadingParticipants = false;
      }
    });
  }

  respondToInvite(status: ParticipationStatus): void {
    this.respondingToInvite = true;
    this.eventService.respondToInvitation(this.event.id, { participationStatus: status }).subscribe({
      next: () => {
        this.event.userParticipationStatus = status;
        this.loadParticipants();
        this.respondingToInvite = false;
      },
      error: (error) => {
        console.error('Failed to respond to invitation:', error);
        this.respondingToInvite = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDateTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'CANCELLED': return 'warn';
      case 'COMPLETED': return 'accent';
      default: return '';
    }
  }

  getParticipationStatusColor(status: ParticipationStatus): string {
    switch (status) {
      case ParticipationStatus.ACCEPTED: return 'primary';
      case ParticipationStatus.DECLINED: return 'warn';
      case ParticipationStatus.PENDING: return 'accent';
      default: return '';
    }
  }
}
