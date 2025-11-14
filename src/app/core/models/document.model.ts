export interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  categoryId?: string;
  uploadedBy: string;
  tags?: string[];
  isPublic: boolean;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  uploadedByName?: string;
  categoryName?: string;
}

export interface UploadDocumentRequest {
  file: File;
  title: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
}
