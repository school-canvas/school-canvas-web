import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClassSchedule, AcademicTerm, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class SchedulerService {
  private apiUrl = environment.apiUrls.scheduler;

  constructor(private http: HttpClient) {}

  createSchedule(request: any): Observable<ClassSchedule> {
    return this.http.post<ClassSchedule>(`${this.apiUrl}/schedules/create`, request);
  }

  getSchedulesByClass(classId: string, page: number = 0, size: number = 20): Observable<PageResponse<ClassSchedule>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ClassSchedule>>(
      `${this.apiUrl}/schedules/class/${classId}`,
      { params }
    );
  }

  getSchedulesByTeacher(teacherId: string, page: number = 0, size: number = 20): Observable<PageResponse<ClassSchedule>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ClassSchedule>>(
      `${this.apiUrl}/schedules/teacher/${teacherId}`,
      { params }
    );
  }

  getAllAcademicTerms(page: number = 0, size: number = 20): Observable<PageResponse<AcademicTerm>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<AcademicTerm>>(
      `${this.apiUrl}/academic-terms/fetchAll`,
      { params }
    );
  }

  getCurrentAcademicTerm(): Observable<AcademicTerm> {
    return this.http.get<AcademicTerm>(`${this.apiUrl}/academic-terms/current`);
  }
}
