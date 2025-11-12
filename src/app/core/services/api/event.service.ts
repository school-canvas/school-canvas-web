import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Event, CreateEventRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = environment.apiUrls.event;

  constructor(private http: HttpClient) {}

  createEvent(request: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events/create`, request);
  }

  getEventById(eventId: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${eventId}`);
  }

  getAllEvents(page: number = 0, size: number = 20): Observable<PageResponse<Event>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Event>>(
      `${this.apiUrl}/events/fetchAll`,
      { params }
    );
  }

  getEventsByDateRange(startDate: string, endDate: string): Observable<Event[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Event[]>(
      `${this.apiUrl}/events/range`,
      { params }
    );
  }

  updateEvent(eventId: string, request: Partial<CreateEventRequest>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/update/${eventId}`, request);
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/delete/${eventId}`);
  }
}
