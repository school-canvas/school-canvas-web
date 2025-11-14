import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Document, UploadDocumentRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = environment.apiUrls.document;

  constructor(private http: HttpClient) {}

  uploadDocument(request: UploadDocumentRequest): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/documents/upload`, request);
  }

  getDocumentById(documentId: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/documents/${documentId}`);
  }

  getDocumentsByOwner(ownerId: string, page: number = 0, size: number = 20): Observable<PageResponse<Document>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Document>>(
      `${this.apiUrl}/documents/owner/${ownerId}`,
      { params }
    );
  }

  getDocumentsByCategory(category: string, page: number = 0, size: number = 20): Observable<PageResponse<Document>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Document>>(
      `${this.apiUrl}/documents/category/${category}`,
      { params }
    );
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${documentId}`);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
  }
}
