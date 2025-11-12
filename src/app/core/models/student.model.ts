export interface Student {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gradeLevel: string;
  enrollmentDate: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
  phoneNumber?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  guardianInformation?: GuardianInformation;
  academicRecords?: StudentAcademicRecord[];
  enrollments?: ClassEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentRequest {
  userId: string;
  studentId?: string; // Auto-generated if not provided
  dateOfBirth: Date;
  gradeLevel: string;
  enrollmentDate?: Date; // Defaults to current date
  phoneNumber?: string;
  address?: AddressRequest;
  emergencyContact?: EmergencyContactRequest;
  guardianInformation?: GuardianInformationRequest;
}

export interface UpdateStudentRequest {
  dateOfBirth?: Date;
  gradeLevel?: string;
  phoneNumber?: string;
  address?: AddressRequest;
  emergencyContact?: EmergencyContactRequest;
  guardianInformation?: GuardianInformationRequest;
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AddressRequest {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface EmergencyContactRequest {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface GuardianInformation {
  id: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName?: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  legalGuardianName?: string;
  legalGuardianPhone?: string;
  legalGuardianEmail?: string;
  legalGuardianRelationship?: string;
}

export interface GuardianInformationRequest {
  fatherName?: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName?: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  legalGuardianName?: string;
  legalGuardianPhone?: string;
  legalGuardianEmail?: string;
  legalGuardianRelationship?: string;
}

export interface StudentAcademicRecord {
  id: string;
  studentId: string;
  academicYear: string;
  semester: string;
  subject: string;
  gradePoints: number;
  letterGrade: string;
  credits: number;
  teacherId: string;
  classId: string;
  examType: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  examDate: Date;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAcademicRecordRequest {
  studentId: string;
  academicYear: string;
  semester: string;
  subject: string;
  gradePoints: number;
  letterGrade: string;
  credits: number;
  teacherId: string;
  classId: string;
  examType: 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  examDate: Date;
  maxMarks: number;
  obtainedMarks: number;
  remarks?: string;
}

export interface UpdateAcademicRecordRequest {
  gradePoints?: number;
  letterGrade?: string;
  credits?: number;
  examDate?: Date;
  maxMarks?: number;
  obtainedMarks?: number;
  remarks?: string;
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  enrollmentDate: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'TRANSFERRED';
  finalGrade?: string;
  finalGradePoints?: number;
  attendancePercentage?: number;
  className?: string;
  subject?: string;
  teacherName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentDTO {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string; // Computed field
  email: string;
  dateOfBirth: Date;
  age: number; // Computed field
  gradeLevel: string;
  enrollmentDate: Date;
  status: string;
  phoneNumber?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  guardianInformation?: GuardianInformation;
  totalEnrollments: number; // Computed field
  averageGrade: number; // Computed field
  attendancePercentage: number; // Computed field
  createdAt: Date;
  updatedAt: Date;
}

// Utility interfaces for filtering and searching
export interface StudentSearchCriteria {
  gradeLevel?: string;
  status?: string;
  enrollmentYear?: number;
  searchTerm?: string; // For name, email, or student ID
}

export interface StudentListResponse {
  students: StudentDTO[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Grade level enum/constants
export const GRADE_LEVELS = [
  'PRE_K',
  'KINDERGARTEN',
  '1ST_GRADE',
  '2ND_GRADE',
  '3RD_GRADE',
  '4TH_GRADE',
  '5TH_GRADE',
  '6TH_GRADE',
  '7TH_GRADE',
  '8TH_GRADE',
  '9TH_GRADE',
  '10TH_GRADE',
  '11TH_GRADE',
  '12TH_GRADE'
] as const;

export type GradeLevel = typeof GRADE_LEVELS[number];

// Student status constants
export const STUDENT_STATUS = [
  'ACTIVE',
  'INACTIVE',
  'GRADUATED',
  'TRANSFERRED'
] as const;

export type StudentStatus = typeof STUDENT_STATUS[number];
