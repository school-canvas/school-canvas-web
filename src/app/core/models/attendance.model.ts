export interface StudentAttendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  studentName?: string;
  className?: string;
  markedByName?: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  SICK = 'SICK'
}

export interface MarkAttendanceRequest {
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkAttendanceRequest {
  classId: string;
  date: string;
  attendances: {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface AttendanceSummary {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  sickDays: number;
  attendancePercentage: number;
  startDate: string;
  endDate: string;
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}
