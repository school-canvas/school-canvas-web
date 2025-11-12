export interface ClassSchedule {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  academicTermId?: string;
  status: ScheduleStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  className?: string;
  subjectName?: string;
  teacherName?: string;
}

export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY'
}

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED'
}

export interface AcademicTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  status: TermStatus;
  tenantId: string;
}

export enum TermStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}
