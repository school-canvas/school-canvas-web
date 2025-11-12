import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CreateStudentRequest, Student, UpdateStudentRequest } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly API_URL = environment.apiUrls.student;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const tenantId = localStorage.getItem('tenantId');
    return new HttpHeaders({
      'X-Tenant-ID': tenantId || ''
    });
  }

  createStudent(request: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.API_URL}/students/create`, request, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to create student'))));
  }

  getStudentByUserId(userId: string): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/students/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to fetch student'))));
  }

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.API_URL}/students/fetchAllStudents`, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to fetch students'))));
  }

  getStudentsByGrade(gradeLevel: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.API_URL}/students/fetchStudentsByGrade/${gradeLevel}`, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to fetch students by grade'))));
  }

  updateStudent(userId: string, request: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.API_URL}/students/updateStudent/${userId}`, request, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to update student'))));
  }

  deleteStudent(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/students/deleteStudent/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to delete student'))));
  }

  verifyStudentExists(userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/students/exists/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to verify student'))));
  }

  getStudentName(userId: string): Observable<string> {
    return this.http.get<string>(`${this.API_URL}/students/getName/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to get student name'))));
  }
}
