// Event Response DTO matching backend EventResponseDTO
export interface Event {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  location?: string;
  startDatetime: string;
  endDatetime: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdBy: string;
  status: EventStatus;
  participantCount: number;
  userParticipationStatus?: ParticipationStatus;
  createdAt: string;
  updatedAt: string;
}

// Create Event Request DTO matching backend CreateEventRequestDTO
export interface CreateEventRequest {
  title: string;
  description?: string;
  categoryId?: string;
  location?: string;
  startDatetime: string;
  endDatetime: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  participantIds?: string[];
  reminderMinutesBefore?: number[]; // e.g., [15, 60, 1440] for 15min, 1hr, 1day before
}

// Update Event Request (partial update)
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  location?: string;
  startDatetime?: string;
  endDatetime?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

// Recurrence Pattern (stored as JSONB in backend)
export interface RecurrencePattern {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number; // e.g., 2 for every 2 weeks
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  dayOfMonth?: number; // 1-31
  endDate?: string;
  occurrences?: number;
}

// Event Status enum matching backend
export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// Event Category matching backend EventCategoryResponseDTO
export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

// Create Event Category Request
export interface CreateEventCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}

// Event Participant matching backend EventParticipantResponseDTO
export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  userName?: string;
  participationStatus: ParticipationStatus;
  responseTime?: string;
  createdAt: string;
}

// Participation Status enum matching backend
export enum ParticipationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

// Update Participation Request
export interface UpdateParticipationRequest {
  participationStatus: ParticipationStatus;
}

// Add Participants Request
export interface AddParticipantsRequest {
  userIds: string[];
}

// Reminder Type enum
export enum ReminderType {
  NOTIFICATION = 'NOTIFICATION',
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}
