import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Report, GenerateReportRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = environment.apiUrls.report;

  constructor(private http: HttpClient) {}

  generateReport(request: GenerateReportRequest): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/reports/generate`, request);
  }

  getReportById(reportId: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/reports/${reportId}`);
  }

  getAllReports(page: number = 0, size: number = 20): Observable<PageResponse<Report>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Report>>(
      `${this.apiUrl}/reports/fetchAll`,
      { params }
    );
  }

  getReportsByType(type: string, page: number = 0, size: number = 20): Observable<PageResponse<Report>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Report>>(
      `${this.apiUrl}/reports/type/${type}`,
      { params }
    );
  }

  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/${reportId}/download`, {
      responseType: 'blob'
    });
  }
}
