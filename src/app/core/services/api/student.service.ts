import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Student, CreateStudentRequest, UpdateStudentRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = environment.apiUrls.student;

  constructor(private http: HttpClient) {}

  createStudent(request: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/students/create`, request);
  }

  getStudentByUserId(userId: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/students/${userId}`);
  }

  getAllStudents(page: number = 0, size: number = 20): Observable<PageResponse<Student>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Student>>(
      `${this.apiUrl}/students/fetchAllStudents`,
      { params }
    );
  }

  updateStudent(userId: string, request: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(
      `${this.apiUrl}/students/updateStudent/${userId}`,
      request
    );
  }

  deleteStudent(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/students/deleteStudent/${userId}`);
  }
}
