import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Subject, Curriculum, Topic, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class CurriculumService {
  private apiUrl = environment.apiUrls.curriculum;

  constructor(private http: HttpClient) {}

  getAllSubjects(page: number = 0, size: number = 20): Observable<PageResponse<Subject>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Subject>>(
      `${this.apiUrl}/subjects/fetchAll`,
      { params }
    );
  }

  getSubjectById(subjectId: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/subjects/${subjectId}`);
  }

  getAllCurricula(page: number = 0, size: number = 20): Observable<PageResponse<Curriculum>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Curriculum>>(
      `${this.apiUrl}/curricula/fetchAll`,
      { params }
    );
  }

  getCurriculumById(curriculumId: string): Observable<Curriculum> {
    return this.http.get<Curriculum>(`${this.apiUrl}/curricula/${curriculumId}`);
  }

  getTopicsBySubject(subjectId: string, page: number = 0, size: number = 20): Observable<PageResponse<Topic>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Topic>>(
      `${this.apiUrl}/topics/subject/${subjectId}`,
      { params }
    );
  }
}
