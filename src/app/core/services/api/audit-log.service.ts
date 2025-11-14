import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditLog, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private apiUrl = environment.apiUrls.auditLogs;

  constructor(private http: HttpClient) {}

  getAllAuditLogs(page: number = 0, size: number = 20): Observable<PageResponse<AuditLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<AuditLog>>(
      `${this.apiUrl}/audit-logs/fetchAll`,
      { params }
    );
  }

  getAuditLogsByUser(userId: string, page: number = 0, size: number = 20): Observable<PageResponse<AuditLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<AuditLog>>(
      `${this.apiUrl}/audit-logs/user/${userId}`,
      { params }
    );
  }

  getAuditLogsByEntity(entityType: string, entityId: string, page: number = 0, size: number = 20): Observable<PageResponse<AuditLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<AuditLog>>(
      `${this.apiUrl}/audit-logs/entity/${entityType}/${entityId}`,
      { params }
    );
  }

  getAuditLogsByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 20): Observable<PageResponse<AuditLog>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<AuditLog>>(
      `${this.apiUrl}/audit-logs/date-range`,
      { params }
    );
  }
}
