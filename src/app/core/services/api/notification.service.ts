import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Notification, NotificationSettings, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = environment.apiUrls.notification;

  constructor(private http: HttpClient) {}

  getNotificationsByUser(userId: string, page: number = 0, size: number = 20): Observable<PageResponse<Notification>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Notification>>(
      `${this.apiUrl}/notifications/user/${userId}`,
      { params }
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/user/${userId}/unread/count`);
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(userId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/user/${userId}/read-all`, {});
  }

  getSettings(userId: string): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.apiUrl}/notifications/settings/${userId}`);
  }

  updateSettings(userId: string, settings: NotificationSettings): Observable<NotificationSettings> {
    return this.http.put<NotificationSettings>(
      `${this.apiUrl}/notifications/settings/${userId}`,
      settings
    );
  }
}
