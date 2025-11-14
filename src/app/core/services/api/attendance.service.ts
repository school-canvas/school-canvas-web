import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StudentAttendance, TeacherAttendance, MarkAttendanceRequest, AttendanceSummary, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private apiUrl = environment.apiUrls.attendance;

  constructor(private http: HttpClient) {}

  markStudentAttendance(request: MarkAttendanceRequest): Observable<StudentAttendance> {
    return this.http.post<StudentAttendance>(`${this.apiUrl}/attendance/student/mark`, request);
  }

  getStudentAttendance(studentId: string, startDate?: string, endDate?: string): Observable<StudentAttendance[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<StudentAttendance[]>(
      `${this.apiUrl}/attendance/student/${studentId}`,
      { params }
    );
  }

  getStudentAttendanceSummary(studentId: string): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(`${this.apiUrl}/attendance/student/${studentId}/summary`);
  }

  markTeacherAttendance(request: MarkAttendanceRequest): Observable<TeacherAttendance> {
    return this.http.post<TeacherAttendance>(`${this.apiUrl}/attendance/teacher/mark`, request);
  }

  getTeacherAttendance(teacherId: string, startDate?: string, endDate?: string): Observable<TeacherAttendance[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<TeacherAttendance[]>(
      `${this.apiUrl}/attendance/teacher/${teacherId}`,
      { params }
    );
  }

  getClassAttendance(classId: string, date: string): Observable<StudentAttendance[]> {
    return this.http.get<StudentAttendance[]>(
      `${this.apiUrl}/attendance/class/${classId}?date=${date}`
    );
  }
}
