export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  categoryId?: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizerId: string;
  maxParticipants?: number;
  status: EventStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  organizerName?: string;
  categoryName?: string;
  participantCount?: number;
}

export enum EventType {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  MEETING = 'MEETING',
  HOLIDAY = 'HOLIDAY',
  EXAM = 'EXAM',
  OTHER = 'OTHER'
}

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventType: EventType;
  categoryId?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  tenantId: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: ParticipantStatus;
  registeredAt: string;
  tenantId: string;
}

export enum ParticipantStatus {
  REGISTERED = 'REGISTERED',
  ATTENDED = 'ATTENDED',
  ABSENT = 'ABSENT',
  CANCELLED = 'CANCELLED'
}
