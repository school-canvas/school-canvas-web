import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClassDTO, CreateClassRequest, ClassEnrollmentDTO, EnrollStudentRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private apiUrl = environment.apiUrls.class;

  constructor(private http: HttpClient) {}

  createClass(request: CreateClassRequest): Observable<ClassDTO> {
    return this.http.post<ClassDTO>(`${this.apiUrl}/classes/create`, request);
  }

  getClassById(classId: string): Observable<ClassDTO> {
    return this.http.get<ClassDTO>(`${this.apiUrl}/classes/${classId}`);
  }

  getAllClasses(page: number = 0, size: number = 20): Observable<PageResponse<ClassDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ClassDTO>>(
      `${this.apiUrl}/classes/fetchAllClasses`,
      { params }
    );
  }

  updateClass(classId: string, request: Partial<CreateClassRequest>): Observable<ClassDTO> {
    return this.http.put<ClassDTO>(
      `${this.apiUrl}/classes/updateClass/${classId}`,
      request
    );
  }

  deleteClass(classId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/classes/deleteClass/${classId}`);
  }

  enrollStudent(request: EnrollStudentRequest): Observable<ClassEnrollmentDTO> {
    return this.http.post<ClassEnrollmentDTO>(`${this.apiUrl}/classes/enroll-student`, request);
  }

  getClassesByTeacher(teacherId: string, page: number = 0, size: number = 20): Observable<PageResponse<ClassDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ClassDTO>>(
      `${this.apiUrl}/classes/teacher/${teacherId}`,
      { params }
    );
  }

  getClassesByStudent(studentId: string, page: number = 0, size: number = 20): Observable<PageResponse<ClassDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ClassDTO>>(
      `${this.apiUrl}/classes/student/${studentId}`,
      { params }
    );
  }
}
