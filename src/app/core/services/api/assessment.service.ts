import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Assessment, CreateAssessmentRequest, Submission, SubmitAssessmentRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private apiUrl = environment.apiUrls.assessment;

  constructor(private http: HttpClient) {}

  createAssessment(request: CreateAssessmentRequest): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.apiUrl}/assessments/create`, request);
  }

  getAssessmentById(assessmentId: string): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.apiUrl}/assessments/${assessmentId}`);
  }

  getAllAssessments(page: number = 0, size: number = 20): Observable<PageResponse<Assessment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Assessment>>(
      `${this.apiUrl}/assessments/fetchAll`,
      { params }
    );
  }

  getAssessmentsByClass(classId: string, page: number = 0, size: number = 20): Observable<PageResponse<Assessment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Assessment>>(
      `${this.apiUrl}/assessments/class/${classId}`,
      { params }
    );
  }

  updateAssessment(assessmentId: string, request: Partial<CreateAssessmentRequest>): Observable<Assessment> {
    return this.http.put<Assessment>(
      `${this.apiUrl}/assessments/update/${assessmentId}`,
      request
    );
  }

  deleteAssessment(assessmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assessments/delete/${assessmentId}`);
  }

  submitAssessment(request: SubmitAssessmentRequest): Observable<Submission> {
    return this.http.post<Submission>(`${this.apiUrl}/submissions/create`, request);
  }

  getSubmissionsByStudent(studentId: string, page: number = 0, size: number = 20): Observable<PageResponse<Submission>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Submission>>(
      `${this.apiUrl}/submissions/student/${studentId}`,
      { params }
    );
  }

  gradeSubmission(submissionId: string, grade: number, feedback?: string): Observable<Submission> {
    return this.http.put<Submission>(
      `${this.apiUrl}/submissions/grade/${submissionId}`,
      { marksObtained: grade, feedback }
    );
  }
}
