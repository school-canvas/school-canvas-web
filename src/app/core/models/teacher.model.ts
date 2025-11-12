export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  department?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  joiningDate?: string;
  designation?: string;
  status: TeacherStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated from User service
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  profilePicture?: string;
}

export enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED'
}

export interface CreateTeacherRequest {
  userId: string;
  employeeId: string;
  department?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  joiningDate?: string;
  designation?: string;
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  status?: TeacherStatus;
}
