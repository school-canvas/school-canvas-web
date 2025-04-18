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
