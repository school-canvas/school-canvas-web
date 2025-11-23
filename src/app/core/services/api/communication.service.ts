import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Message, MessageThread, Announcement, CreateAnnouncementRequest, ComposeMessageRequest, PageResponse, FileAttachment } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private apiUrl = environment.apiUrls.communication;

  constructor(private http: HttpClient) {}

  // Message operations
  sendMessage(request: ComposeMessageRequest): Observable<Message> {
    const formData = new FormData();
    formData.append('recipientIds', JSON.stringify(request.recipientIds));
    formData.append('subject', request.subject);
    formData.append('content', request.content);
    
    if (request.attachments && request.attachments.length > 0) {
      request.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    return this.http.post<Message>(`${this.apiUrl}/messages/compose`, formData);
  }

  replyToMessage(threadId: string, content: string, attachments?: File[]): Observable<Message> {
    const formData = new FormData();
    formData.append('content', content);
    
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    return this.http.post<Message>(`${this.apiUrl}/messages/thread/${threadId}/reply`, formData);
  }

  getMessageThread(threadId: string, page: number = 0, size: number = 50): Observable<PageResponse<Message>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Message>>(
      `${this.apiUrl}/messages/thread/${threadId}`,
      { params }
    );
  }

  getUserThreads(page: number = 0, size: number = 20): Observable<PageResponse<MessageThread>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<MessageThread>>(
      `${this.apiUrl}/messages/threads`,
      { params }
    );
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  markThreadAsRead(threadId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/messages/thread/${threadId}/read`, {});
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`);
  }

  // Attachment operations
  downloadAttachment(attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  // Announcement operations
  createAnnouncement(request: CreateAnnouncementRequest): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/announcements`, request);
  }

  getAllAnnouncements(page: number = 0, size: number = 20): Observable<PageResponse<Announcement>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Announcement>>(
      `${this.apiUrl}/announcements`,
      { params }
    );
  }

  getAnnouncementById(announcementId: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/announcements/${announcementId}`);
  }

  updateAnnouncement(announcementId: string, request: Partial<CreateAnnouncementRequest>): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/announcements/${announcementId}`, request);
  }

  deleteAnnouncement(announcementId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/announcements/${announcementId}`);
  }
}
