import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Guardian, StudentGuardian, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class GuardianService {
  private apiUrl = environment.apiUrls.guardian;

  constructor(private http: HttpClient) {}

  createGuardian(request: any): Observable<Guardian> {
    return this.http.post<Guardian>(`${this.apiUrl}/guardians/create`, request);
  }

  getGuardianById(guardianId: string): Observable<Guardian> {
    return this.http.get<Guardian>(`${this.apiUrl}/guardians/${guardianId}`);
  }

  getAllGuardians(page: number = 0, size: number = 20): Observable<PageResponse<Guardian>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Guardian>>(
      `${this.apiUrl}/guardians/fetchAll`,
      { params }
    );
  }

  getGuardiansByStudent(studentId: string): Observable<StudentGuardian[]> {
    return this.http.get<StudentGuardian[]>(
      `${this.apiUrl}/guardians/student/${studentId}`
    );
  }

  linkGuardianToStudent(guardianId: string, studentId: string, relation: string): Observable<StudentGuardian> {
    return this.http.post<StudentGuardian>(`${this.apiUrl}/guardians/link`, {
      guardianId,
      studentId,
      relation
    });
  }
}
