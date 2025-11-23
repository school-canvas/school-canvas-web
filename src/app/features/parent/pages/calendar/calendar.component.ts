import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/services/api/event.service';
import { Event, EventCategory, ParticipationStatus } from '../../../../core/models';
import { CreateEventDialogComponent } from '../../../../shared/dialogs/create-event-dialog/create-event-dialog.component';
import { EventDetailDialogComponent } from '../../../../shared/dialogs/event-detail-dialog/event-detail-dialog.component';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  selectedDate: Date | null = null;

  calendarDays: CalendarDay[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  events: Event[] = [];
  categories: EventCategory[] = [];
  selectedCategoryId: string | null = null;
  loading = false;

  ParticipationStatus = ParticipationStatus;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.generateCalendar();
    this.loadEventsForMonth();
  }

  loadCategories(): void {
    this.eventService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => console.error('Failed to load categories:', error)
    });
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Add previous month's trailing days
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth, -i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: []
      });
    }

    // Add current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        events: []
      });
    }

    // Add next month's leading days
    const remainingDays = 42 - this.calendarDays.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, day);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: []
      });
    }
  }

  loadEventsForMonth(): void {
    this.loading = true;
    const startDate = new Date(this.currentYear, this.currentMonth, 1);
    const endDate = new Date(this.currentYear, this.currentMonth + 1, 0, 23, 59, 59);

    const startDatetime = this.formatDateTimeForApi(startDate);
    const endDatetime = this.formatDateTimeForApi(endDate);

    this.eventService.getCalendarEvents(startDatetime, endDatetime).subscribe({
      next: (events) => {
        this.events = this.selectedCategoryId
          ? events.filter(e => e.categoryId === this.selectedCategoryId)
          : events;
        this.mapEventsToCalendar();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load events:', error);
        this.loading = false;
      }
    });
  }

  mapEventsToCalendar(): void {
    this.calendarDays.forEach(day => {
      day.events = this.events.filter(event => {
        const eventDate = new Date(event.startDatetime);
        return this.isSameDay(eventDate, day.date);
      });
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
    this.loadEventsForMonth();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
    this.loadEventsForMonth();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
    this.loadEventsForMonth();
  }

  onCategoryFilterChange(): void {
    this.loadEventsForMonth();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate = day.date;
  }

  openEventDetail(event: Event, dayClickEvent: MouseEvent): void {
    dayClickEvent.stopPropagation();
    const dialogRef = this.dialog.open(EventDetailDialogComponent, {
      width: '700px',
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadEventsForMonth();
      }
    });
  }

  createEvent(): void {
    const dialogRef = this.dialog.open(CreateEventDialogComponent, {
      width: '800px',
      data: { categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEventsForMonth();
      }
    });
  }

  viewAllEvents(): void {
    this.router.navigate(['/parent/event-list']);
  }

  getEventColor(event: Event): string {
    if (event.categoryId && this.categories.length > 0) {
      const category = this.categories.find(c => c.id === event.categoryId);
      return category?.color || '#2196F3';
    }
    return '#2196F3';
  }

  getEventStatusColor(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return '#4CAF50';
      case 'CANCELLED':
        return '#f44336';
      case 'COMPLETED':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  }

  getParticipationIcon(status: ParticipationStatus | undefined): string {
    switch (status) {
      case ParticipationStatus.ACCEPTED:
        return 'check_circle';
      case ParticipationStatus.DECLINED:
        return 'cancel';
      case ParticipationStatus.PENDING:
        return 'schedule';
      default:
        return 'help_outline';
    }
  }

  getParticipationColor(status: ParticipationStatus | undefined): string {
    switch (status) {
      case ParticipationStatus.ACCEPTED:
        return '#4CAF50';
      case ParticipationStatus.DECLINED:
        return '#f44336';
      case ParticipationStatus.PENDING:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  }

  formatTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  formatDateTimeForApi(date: Date): string {
    return date.toISOString();
  }
}

