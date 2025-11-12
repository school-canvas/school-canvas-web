export interface ClassDTO {
  id: string;
  className: string;
  subject: string;
  gradeLevel: string;
  teacherId: string;
  teacherName?: string;
  description?: string;
  schedule?: string;
  enrollmentCount?: number;
  maxCapacity?: number;
}

export interface CreateClassRequest {
  className: string;
  subject: string;
  gradeLevel: string;
  teacherId: string;
  description?: string;
  maxCapacity?: number;
}

export interface EnrollStudentRequest {
  classId: string;
  studentId: string;
}

export interface ClassEnrollmentDTO {
  id: string;
  classId: string;
  studentId: string;
  enrollmentDate: Date;
  status: string;
  className?: string;
  studentName?: string;
}