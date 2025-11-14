import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Teacher, CreateTeacherRequest, UpdateTeacherRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private apiUrl = environment.apiUrls.teacher;

  constructor(private http: HttpClient) {}

  createTeacher(request: CreateTeacherRequest): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.apiUrl}/teachers/create`, request);
  }

  getTeacherByUserId(userId: string): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/teachers/${userId}`);
  }

  getAllTeachers(page: number = 0, size: number = 20): Observable<PageResponse<Teacher>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Teacher>>(
      `${this.apiUrl}/teachers/fetchAllTeachers`,
      { params }
    );
  }

  updateTeacher(userId: string, request: UpdateTeacherRequest): Observable<Teacher> {
    return this.http.put<Teacher>(
      `${this.apiUrl}/teachers/updateTeacher/${userId}`,
      request
    );
  }

  deleteTeacher(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/teachers/deleteTeacher/${userId}`);
  }

  getTeachersByStatus(status: string, page: number = 0, size: number = 20): Observable<PageResponse<Teacher>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Teacher>>(
      `${this.apiUrl}/teachers/status/${status}`,
      { params }
    );
  }
}
