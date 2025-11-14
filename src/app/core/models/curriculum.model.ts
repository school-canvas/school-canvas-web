export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  curriculumId?: string;
  gradeLevel?: string;
  credits?: number;
  status: SubjectStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  curriculumName?: string;
}

export enum SubjectStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface Curriculum {
  id: string;
  name: string;
  description?: string;
  academicYear: string;
  status: CurriculumStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum CurriculumStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  orderIndex?: number;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}
