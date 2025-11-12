import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  response?: FileUploadResponse;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.apiUrls.document;

  // File size limits (in bytes)
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

  // Allowed file types
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  constructor(private http: HttpClient) { }

  /**
   * Upload a profile picture
   */
  uploadProfilePicture(file: File, userId: string): Observable<UploadProgress> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', 'profile');

    return this.uploadWithProgress(`${this.apiUrl}/upload/profile`, formData);
  }

  /**
   * Upload a document (assignment, certificate, etc.)
   */
  uploadDocument(file: File, category: string, metadata?: any): Observable<UploadProgress> {
    const validation = this.validateDocumentFile(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return this.uploadWithProgress(`${this.apiUrl}/upload/document`, formData);
  }

  /**
   * Upload an assignment submission
   */
  uploadAssignmentSubmission(file: File, assessmentId: string, studentId: string): Observable<UploadProgress> {
    const validation = this.validateDocumentFile(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assessmentId', assessmentId);
    formData.append('studentId', studentId);

    return this.uploadWithProgress(`${this.apiUrl}/upload/assignment`, formData);
  }

  /**
   * Upload multiple files
   */
  uploadMultipleFiles(files: File[], category: string): Observable<UploadProgress[]> {
    const uploads: Observable<UploadProgress>[] = files.map(file => 
      this.uploadDocument(file, category)
    );
    
    // For simplicity, we'll return array of observables
    // In production, you might want to use forkJoin or combineLatest
    return new Observable(observer => {
      const results: UploadProgress[] = [];
      let completed = 0;
      
      uploads.forEach((upload, index) => {
        upload.subscribe({
          next: (progress) => {
            results[index] = progress;
            observer.next(results);
            if (progress.status === 'completed' || progress.status === 'error') {
              completed++;
              if (completed === files.length) {
                observer.complete();
              }
            }
          },
          error: (error) => {
            results[index] = {
              progress: 0,
              status: 'error',
              error: error.message
            };
            completed++;
            observer.next(results);
            if (completed === files.length) {
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Delete a file
   */
  deleteFile(fileUrl: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete`, { body: { fileUrl } });
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only JPEG, PNG, and GIF images are allowed.' 
      };
    }

    if (file.size > this.MAX_IMAGE_SIZE) {
      return { 
        valid: false, 
        error: `File size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Validate document file
   */
  validateDocumentFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only PDF, Word, Excel, and text files are allowed.' 
      };
    }

    if (file.size > this.MAX_DOCUMENT_SIZE) {
      return { 
        valid: false, 
        error: `File size exceeds maximum limit of ${this.MAX_DOCUMENT_SIZE / 1024 / 1024}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is an image
   */
  isImageFile(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  /**
   * Private method to upload with progress tracking
   */
  private uploadWithProgress(url: string, formData: FormData): Observable<UploadProgress> {
    return this.http.post(url, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total 
              ? Math.round((100 * event.loaded) / event.total) 
              : 0;
            return {
              progress,
              status: 'uploading' as const
            };
          
          case HttpEventType.Response:
            return {
              progress: 100,
              status: 'completed' as const,
              response: event.body
            };
          
          default:
            return {
              progress: 0,
              status: 'pending' as const
            };
        }
      }),
      catchError((error) => {
        return throwError(() => ({
          progress: 0,
          status: 'error' as const,
          error: error.message || 'Upload failed'
        }));
      })
    );
  }
}
