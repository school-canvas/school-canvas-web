export interface Report {
  id: string;
  reportType: ReportType;
  title: string;
  description?: string;
  parameters?: any;
  fileUrl?: string;
  generatedBy: string;
  status: ReportStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  generatedByName?: string;
}

export enum ReportType {
  STUDENT_ACADEMIC = 'STUDENT_ACADEMIC',
  ATTENDANCE_SUMMARY = 'ATTENDANCE_SUMMARY',
  FINANCIAL_SUMMARY = 'FINANCIAL_SUMMARY',
  CLASS_PERFORMANCE = 'CLASS_PERFORMANCE',
  FEE_COLLECTION = 'FEE_COLLECTION',
  LIBRARY_USAGE = 'LIBRARY_USAGE',
  CUSTOM = 'CUSTOM'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface GenerateReportRequest {
  reportType: ReportType;
  title: string;
  description?: string;
  parameters: {
    studentId?: string;
    classId?: string;
    startDate?: string;
    endDate?: string;
    gradeLevel?: string;
    academicYear?: string;
    [key: string]: any;
  };
}
