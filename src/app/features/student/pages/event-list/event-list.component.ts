import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/services/api/event.service';
import { Event, EventCategory, EventStatus } from '../../../../core/models';
import { EventDetailDialogComponent } from '../../../../shared/dialogs/event-detail-dialog/event-detail-dialog.component';
import { CreateEventDialogComponent } from '../../../../shared/dialogs/create-event-dialog/create-event-dialog.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  categories: EventCategory[] = [];
  selectedCategoryId: string | null = null;
  selectedStatus: EventStatus | null = null;
  loading = false;
  page = 0;
  size = 20;
  hasMore = true;

  EventStatus = EventStatus;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents();
  }

  loadCategories(): void {
    this.eventService.getAllCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Failed to load categories:', error)
    });
  }

  loadEvents(): void {
    this.loading = true;
    const operation = this.selectedStatus
      ? this.eventService.getEventsByStatus(this.selectedStatus, this.page, this.size)
      : this.selectedCategoryId
      ? this.eventService.getEventsByCategory(this.selectedCategoryId, this.page, this.size)
      : this.eventService.getAllEvents(this.page, this.size);

    operation.subscribe({
      next: (response) => {
        this.events = this.page === 0 ? response.content : [...this.events, ...response.content];
        this.hasMore = !response.last;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load events:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.page = 0;
    this.events = [];
    this.loadEvents();
  }

  loadMore(): void {
    if (!this.loading && this.hasMore) {
      this.page++;
      this.loadEvents();
    }
  }

  openEventDetail(event: Event): void {
    this.dialog.open(EventDetailDialogComponent, {
      width: '700px',
      data: { event }
    }).afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.onFilterChange();
      }
    });
  }

  createEvent(): void {
    this.dialog.open(CreateEventDialogComponent, {
      width: '800px',
      data: { categories: this.categories }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.onFilterChange();
      }
    });
  }

  goToCalendar(): void {
    this.router.navigate(['/student/calendar']);
  }

  getEventColor(event: Event): string {
    const category = this.categories.find(c => c.id === event.categoryId);
    return category?.color || '#2196F3';
  }

  formatDateTime(datetime: string): string {
    return new Date(datetime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

