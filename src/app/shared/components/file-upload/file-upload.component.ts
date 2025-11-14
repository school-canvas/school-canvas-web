import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileUploadService, FileUploadResponse, UploadProgress } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  @Input() accept: string = '*/*'; // File types to accept (e.g., 'image/*', '.pdf,.doc')
  @Input() multiple: boolean = false;
  @Input() maxSize: number = 10 * 1024 * 1024; // 10MB default
  @Input() uploadType: 'profile' | 'document' | 'assignment' = 'document';
  @Input() buttonText: string = 'Upload File';
  @Input() buttonIcon: string = 'cloud_upload';
  @Input() showPreview: boolean = true;
  @Input() userId?: string;
  @Input() category?: string;
  @Input() metadata?: any;
  
  @Output() fileSelected = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<FileUploadResponse>();
  @Output() uploadError = new EventEmitter<string>();
  @Output() uploadProgress = new EventEmitter<number>();
  
  selectedFiles: File[] = [];
  previews: string[] = [];
  uploading: boolean = false;
  progress: number = 0;

  constructor(
    private fileUploadService: FileUploadService,
    private snackBar: MatSnackBar
  ) {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.selectedFiles = files;
      this.fileSelected.emit(files);
      
      // Generate previews for images
      if (this.showPreview) {
        this.generatePreviews(files);
      }
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.snackBar.open('Please select a file first', 'Close', { duration: 3000 });
      return;
    }

    this.uploading = true;
    this.progress = 0;

    const file = this.selectedFiles[0]; // For now, handle single file upload

    let upload$;
    
    switch (this.uploadType) {
      case 'profile':
        if (!this.userId) {
          this.snackBar.open('User ID is required for profile upload', 'Close', { duration: 3000 });
          this.uploading = false;
          return;
        }
        upload$ = this.fileUploadService.uploadProfilePicture(file, this.userId);
        break;
      
      case 'assignment':
        upload$ = this.fileUploadService.uploadAssignmentSubmission(
          file,
          this.metadata?.assessmentId,
          this.metadata?.studentId
        );
        break;
      
      case 'document':
      default:
        upload$ = this.fileUploadService.uploadDocument(
          file,
          this.category || 'general',
          this.metadata
        );
        break;
    }

    upload$.subscribe({
      next: (progress: UploadProgress) => {
        this.progress = progress.progress;
        this.uploadProgress.emit(progress.progress);
        
        if (progress.status === 'completed' && progress.response) {
          this.uploading = false;
          this.uploadComplete.emit(progress.response);
          this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
          this.clearSelection();
        }
      },
      error: (error) => {
        this.uploading = false;
        this.progress = 0;
        const errorMessage = error.message || 'Upload failed';
        this.uploadError.emit(errorMessage);
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  clearSelection(): void {
    this.selectedFiles = [];
    this.previews = [];
    this.progress = 0;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private generatePreviews(files: File[]): void {
    this.previews = [];
    files.forEach(file => {
      if (this.fileUploadService.isImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Use icon for non-image files
        this.previews.push('');
      }
    });
  }

  getFileIcon(file: File): string {
    const extension = this.fileUploadService.getFileExtension(file.name);
    const iconMap: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'ppt': 'slideshow',
      'pptx': 'slideshow',
      'txt': 'text_snippet',
      'csv': 'table_chart'
    };
    return iconMap[extension] || 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }
}
