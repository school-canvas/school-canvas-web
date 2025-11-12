import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subject, of } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ChartComponent, ChartData } from '../../../../shared/components/chart/chart.component';
import { StudentService } from '../../../../core/services/student.service';
import { selectUser } from '../../../auth/state/auth.selectors';

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  classId?: string;
  className?: string;
  remarks?: string;
  markedBy?: string;
  markedAt?: string;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  attendance?: AttendanceRecord;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    PageHeaderComponent,
    StatsCardComponent,
    EmptyStateComponent,
    ChartComponent
  ],
  templateUrl: './my-attendance.component.html',
  styleUrl: './my-attendance.component.css'
})
export class MyAttendanceComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  studentId: string = '';
  currentDate = new Date();
  viewMode: 'month' | 'week' = 'month';
  
  // Calendar data
  calendarDays: CalendarDay[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Attendance data
  attendanceRecords: AttendanceRecord[] = [];
  recentAttendance: AttendanceRecord[] = [];
  stats: AttendanceStats = {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    excusedDays: 0,
    attendanceRate: 0
  };

  // Chart data
  attendanceTrendChart!: ChartData;
  attendanceDistributionChart!: ChartData;

  // Table configuration
  displayedColumns: string[] = ['date', 'status', 'class', 'remarks'];

  constructor(
    private studentService: StudentService,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(take(1))
      .subscribe(user => {
        if (user?.id) {
          this.studentId = user.id;
          this.loadAttendanceData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttendanceData(): void {
    this.loading = true;

    // Mock attendance data - replace with actual API call when available
    const mockAttendance = this.generateMockAttendance();
    
    setTimeout(() => {
      this.attendanceRecords = mockAttendance;
      this.calculateStatistics();
      this.generateCalendar();
      this.updateRecentAttendance();
      this.loading = false;
    }, 500);
  }

  generateMockAttendance(): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Generate 20 days of attendance
    for (let i = 0; i < 20; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const statuses: Array<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
      const weights = [0.85, 0.05, 0.08, 0.02]; // Mostly present
      const random = Math.random();
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' = 'PRESENT';
      
      let cumulative = 0;
      for (let j = 0; j < statuses.length; j++) {
        cumulative += weights[j];
        if (random <= cumulative) {
          status = statuses[j];
          break;
        }
      }
      
      records.push({
        id: `att-${i}`,
        studentId: this.studentId,
        date: date.toISOString(),
        status,
        className: ['Mathematics', 'Science', 'English', 'History', 'Physical Education'][i % 5],
        remarks: status === 'ABSENT' ? 'Unexcused absence' : status === 'LATE' ? 'Arrived 15 minutes late' : status === 'EXCUSED' ? 'Medical appointment' : undefined,
        markedBy: 'Teacher Name',
        markedAt: date.toISOString()
      });
    }
    
    return records;
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    if (this.viewMode === 'month') {
      // Get first day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Get starting day (include previous month days)
      const startingDayOfWeek = firstDay.getDay();
      
      // Add days from previous month
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month, -i);
        this.calendarDays.push(this.createCalendarDay(date, false));
      }
      
      // Add days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        this.calendarDays.push(this.createCalendarDay(date, true));
      }
      
      // Add days from next month to complete grid
      const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        this.calendarDays.push(this.createCalendarDay(date, false));
      }
    } else {
      // Week view
      const currentDay = this.currentDate.getDate();
      const currentDayOfWeek = this.currentDate.getDay();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(year, month, currentDay - currentDayOfWeek + i);
        this.calendarDays.push(this.createCalendarDay(date, true));
      }
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Find attendance record for this date
    const dateStr = date.toISOString().split('T')[0];
    const attendance = this.attendanceRecords.find(record => 
      record.date.split('T')[0] === dateStr
    );

    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday,
      isWeekend,
      attendance
    };
  }

  calculateStatistics(): void {
    const stats = {
      totalDays: this.attendanceRecords.length,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      excusedDays: 0,
      attendanceRate: 0
    };

    this.attendanceRecords.forEach(record => {
      switch (record.status) {
        case 'PRESENT':
          stats.presentDays++;
          break;
        case 'ABSENT':
          stats.absentDays++;
          break;
        case 'LATE':
          stats.lateDays++;
          break;
        case 'EXCUSED':
          stats.excusedDays++;
          break;
      }
    });

    if (stats.totalDays > 0) {
      stats.attendanceRate = ((stats.presentDays + stats.lateDays) / stats.totalDays) * 100;
    }

    this.stats = stats;
    this.generateCharts();
  }

  updateRecentAttendance(): void {
    this.recentAttendance = [...this.attendanceRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  getMonthStartDate(): Date {
    return new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
  }

  getMonthEndDate(): Date {
    return new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
  }

  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.loadAttendanceData();
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.loadAttendanceData();
  }

  previousWeek(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      this.currentDate.getDate() - 7
    );
    this.generateCalendar();
  }

  nextWeek(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      this.currentDate.getDate() + 7
    );
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.loadAttendanceData();
  }

  onViewModeChange(mode: 'month' | 'week'): void {
    this.viewMode = mode;
    this.generateCalendar();
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PRESENT': 'status-present',
      'ABSENT': 'status-absent',
      'LATE': 'status-late',
      'EXCUSED': 'status-excused'
    };
    return statusMap[status] || '';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'PRESENT': 'check_circle',
      'ABSENT': 'cancel',
      'LATE': 'schedule',
      'EXCUSED': 'assignment_turned_in'
    };
    return iconMap[status] || 'help';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCurrentMonthYear(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  generateCharts(): void {
    // Attendance Distribution Pie Chart
    this.attendanceDistributionChart = {
      labels: ['Present', 'Absent', 'Late', 'Excused'],
      datasets: [{
        label: 'Days',
        data: [
          this.stats.presentDays,
          this.stats.absentDays,
          this.stats.lateDays,
          this.stats.excusedDays
        ],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3']
      }]
    };

    // Attendance Trend Line Chart (last 30 days)
    const last30Days = this.attendanceRecords.slice(-30);
    const trendData = this.groupAttendanceByWeek(last30Days);

    this.attendanceTrendChart = {
      labels: trendData.labels,
      datasets: [{
        label: 'Attendance Rate (%)',
        data: trendData.rates,
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  groupAttendanceByWeek(records: AttendanceRecord[]): { labels: string[], rates: number[] } {
    const weekMap = new Map<string, { present: number, total: number }>();
    
    records.forEach(record => {
      const date = new Date(record.date);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { present: 0, total: 0 });
      }
      
      const week = weekMap.get(weekKey)!;
      week.total++;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        week.present++;
      }
    });
    
    const labels: string[] = [];
    const rates: number[] = [];
    
    Array.from(weekMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([weekKey, data]) => {
        const weekDate = new Date(weekKey);
        labels.push(this.formatWeekLabel(weekDate));
        rates.push(data.total > 0 ? (data.present / data.total) * 100 : 0);
      });
    
    return { labels, rates };
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  formatWeekLabel(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  }

  printAttendance(): void {
    window.print();
  }

  downloadAttendance(): void {
    console.log('Download attendance report');
    // TODO: Implement CSV/PDF download
  }
}
