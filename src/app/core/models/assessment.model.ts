export interface Assessment {
  id: string;
  title: string;
  description?: string;
  classId: string;
  subjectId?: string;
  assessmentTypeId: string;
  totalMarks: number;
  passingMarks?: number;
  dueDate: string;
  instructions?: string;
  attachmentUrl?: string;
  status: AssessmentStatus;
  createdBy: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  className?: string;
  subjectName?: string;
  assessmentTypeName?: string;
  createdByName?: string;
}

export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  GRADED = 'GRADED',
  CANCELLED = 'CANCELLED'
}

export interface CreateAssessmentRequest {
  title: string;
  description?: string;
  classId: string;
  subjectId?: string;
  assessmentTypeId: string;
  totalMarks: number;
  passingMarks?: number;
  dueDate: string;
  instructions?: string;
  attachmentUrl?: string;
}

export interface UpdateAssessmentRequest extends Partial<CreateAssessmentRequest> {
  status?: AssessmentStatus;
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  submissionDate: string;
  submittedUrl?: string;
  marksObtained?: number;
  feedback?: string;
  status: SubmissionStatus;
  gradedBy?: string;
  gradedDate?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  studentName?: string;
  assessmentTitle?: string;
}

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  LATE_SUBMISSION = 'LATE_SUBMISSION',
  GRADED = 'GRADED',
  RESUBMISSION_REQUIRED = 'RESUBMISSION_REQUIRED'
}

export interface SubmitAssessmentRequest {
  assessmentId: string;
  submittedUrl?: string;
}

export interface GradeSubmissionRequest {
  marksObtained: number;
  feedback?: string;
}

export interface AssessmentType {
  id: string;
  name: string;
  description?: string;
  weightage?: number;
  tenantId: string;
}
