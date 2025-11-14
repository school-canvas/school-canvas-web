import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Message, MessageThread, Announcement, CreateAnnouncementRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private apiUrl = environment.apiUrls.communication;

  constructor(private http: HttpClient) {}

  // Message operations
  sendMessage(request: any): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages/send`, request);
  }

  getMessageThread(threadId: string): Observable<MessageThread> {
    return this.http.get<MessageThread>(`${this.apiUrl}/messages/thread/${threadId}`);
  }

  getMessagesByUser(userId: string, page: number = 0, size: number = 20): Observable<PageResponse<Message>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Message>>(
      `${this.apiUrl}/messages/user/${userId}`,
      { params }
    );
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  // Announcement operations
  createAnnouncement(request: CreateAnnouncementRequest): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/announcements/create`, request);
  }

  getAllAnnouncements(page: number = 0, size: number = 20): Observable<PageResponse<Announcement>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Announcement>>(
      `${this.apiUrl}/announcements/fetchAll`,
      { params }
    );
  }

  getAnnouncementsByRole(role: string, page: number = 0, size: number = 20): Observable<PageResponse<Announcement>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Announcement>>(
      `${this.apiUrl}/announcements/role/${role}`,
      { params }
    );
  }
}
