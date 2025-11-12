export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  roles: Role[]
  groups?: any[]
  active: boolean
  status: UserStatus
  tenantId: string
  userRoles?: UserRole[];
}

export interface UserRole {
  id: string
  role: string
}

export interface Permission {
  id: string
  name: string
  description?: string
  resourceType?: string
  action?: string
}

export interface Role {
  id: string;
  name: string;
  description: string;
  predefined: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface UserWithRoles extends User{
    detailedRoles: Role[];
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  role?: string;
  tenantId?: string;
}

// Helper to get primary role from roles array
export function getPrimaryRole(user: User): string {
  if (user.roles && user.roles.length > 0) {
    return user.roles[0].name;
  }
  if (user.userRoles && user.userRoles.length > 0) {
    return user.userRoles[0].role;
  }
  return 'USER';
}
