import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventCategory,
  CreateEventCategoryRequest,
  EventParticipant,
  UpdateParticipationRequest,
  AddParticipantsRequest,
  EventStatus,
  PageResponse
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.apiUrls.event}/api`;

  constructor(private http: HttpClient) {}

  // ==================== Event Management ====================

  /**
   * Create a new event with participants and reminders
   * @Authorization PRINCIPAL, TEACHER, ADMIN
   */
  createEvent(request: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, request);
  }

  /**
   * Get event by ID
   * @Authorization Authenticated
   */
  getEventById(eventId: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${eventId}`);
  }

  /**
   * Get all events with pagination
   * @Authorization Authenticated
   */
  getAllEvents(page: number = 0, size: number = 20): Observable<PageResponse<Event>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Event>>(`${this.apiUrl}/events`, { params });
  }

  /**
   * Get events created by current user
   * @Authorization Authenticated
   */
  getMyEvents(page: number = 0, size: number = 20): Observable<PageResponse<Event>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Event>>(`${this.apiUrl}/events/my-events`, { params });
  }

  /**
   * Get events in date range (for calendar view)
   * @Authorization Authenticated
   */
  getCalendarEvents(startDatetime: string, endDatetime: string): Observable<Event[]> {
    const params = new HttpParams()
      .set('start', startDatetime)
      .set('end', endDatetime);
    return this.http.get<Event[]>(`${this.apiUrl}/events/calendar`, { params });
  }

  /**
   * Get events by status (SCHEDULED, CANCELLED, COMPLETED)
   * @Authorization Authenticated
   */
  getEventsByStatus(status: EventStatus, page: number = 0, size: number = 20): Observable<PageResponse<Event>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Event>>(`${this.apiUrl}/events/status/${status}`, { params });
  }

  /**
   * Get events by category
   * @Authorization Authenticated
   */
  getEventsByCategory(categoryId: string, page: number = 0, size: number = 20): Observable<PageResponse<Event>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Event>>(`${this.apiUrl}/events/category/${categoryId}`, { params });
  }

  /**
   * Update event details
   * @Authorization PRINCIPAL, TEACHER, ADMIN
   */
  updateEvent(eventId: string, request: UpdateEventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${eventId}`, request);
  }

  /**
   * Cancel an event (sets status to CANCELLED)
   * @Authorization PRINCIPAL, TEACHER, ADMIN
   */
  cancelEvent(eventId: string): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${eventId}/cancel`, {});
  }

  /**
   * Delete an event permanently
   * @Authorization PRINCIPAL, ADMIN
   */
  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventId}`);
  }

  // ==================== Event Categories ====================

  /**
   * Create a new event category
   * @Authorization PRINCIPAL, ADMIN
   */
  createCategory(request: CreateEventCategoryRequest): Observable<EventCategory> {
    return this.http.post<EventCategory>(`${this.apiUrl}/event-categories`, request);
  }

  /**
   * Get category by ID
   * @Authorization Authenticated
   */
  getCategoryById(categoryId: string): Observable<EventCategory> {
    return this.http.get<EventCategory>(`${this.apiUrl}/event-categories/${categoryId}`);
  }

  /**
   * Get all event categories
   * @Authorization Authenticated
   */
  getAllCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(`${this.apiUrl}/event-categories`);
  }

  /**
   * Update event category
   * @Authorization PRINCIPAL, ADMIN
   */
  updateCategory(categoryId: string, request: Partial<CreateEventCategoryRequest>): Observable<EventCategory> {
    return this.http.put<EventCategory>(`${this.apiUrl}/event-categories/${categoryId}`, request);
  }

  /**
   * Delete event category
   * @Authorization PRINCIPAL, ADMIN
   */
  deleteCategory(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/event-categories/${categoryId}`);
  }

  // ==================== Event Participants ====================

  /**
   * Add participants to an event
   * @Authorization PRINCIPAL, TEACHER, ADMIN
   */
  addParticipants(eventId: string, request: AddParticipantsRequest): Observable<EventParticipant[]> {
    return this.http.post<EventParticipant[]>(`${this.apiUrl}/events/${eventId}/participants/add`, request);
  }

  /**
   * Respond to event invitation (PENDING → ACCEPTED/DECLINED)
   * @Authorization Authenticated
   */
  respondToInvitation(eventId: string, request: UpdateParticipationRequest): Observable<EventParticipant> {
    return this.http.put<EventParticipant>(`${this.apiUrl}/events/${eventId}/participants/respond`, request);
  }

  /**
   * Get all participants for an event
   * @Authorization Authenticated
   */
  getEventParticipants(eventId: string): Observable<EventParticipant[]> {
    return this.http.get<EventParticipant[]>(`${this.apiUrl}/events/${eventId}/participants`);
  }

  /**
   * Remove a participant from an event
   * @Authorization PRINCIPAL, TEACHER, ADMIN
   */
  removeParticipant(eventId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventId}/participants/${userId}`);
  }
}
