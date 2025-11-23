import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Notification, NotificationSettings, DeviceToken, RegisterDeviceRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = environment.apiUrls.notification;

  constructor(private http: HttpClient) {}

  // Notification operations
  getUserNotifications(page: number = 0, size: number = 20): Observable<PageResponse<Notification>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Notification>>(
      `${this.apiUrl}/notifications/user`,
      { params }
    );
  }

  getUnreadNotifications(page: number = 0, size: number = 20): Observable<PageResponse<Notification>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Notification>>(
      `${this.apiUrl}/notifications/unread`,
      { params }
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/unread/count`);
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/read-all`, {});
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notifications/${notificationId}`);
  }

  // Notification Settings operations
  getSettings(): Observable<NotificationSettings[]> {
    return this.http.get<NotificationSettings[]>(`${this.apiUrl}/settings`);
  }

  updateSetting(settingId: string, settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    return this.http.put<NotificationSettings>(
      `${this.apiUrl}/settings/${settingId}`,
      settings
    );
  }

  // Device Token operations (for push notifications)
  registerDevice(request: RegisterDeviceRequest): Observable<DeviceToken> {
    return this.http.post<DeviceToken>(`${this.apiUrl}/devices/register`, request);
  }

  getUserDevices(): Observable<DeviceToken[]> {
    return this.http.get<DeviceToken[]>(`${this.apiUrl}/devices`);
  }

  deactivateDevice(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.delete(`${this.apiUrl}/devices`, { params });
  }

  removeAllDevices(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/devices/all`);
  }
}
