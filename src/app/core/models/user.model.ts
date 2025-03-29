export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
  active: boolean
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
  id: string
  name: string
  description?: string
  permissions: Permission[];
}

export interface UserWithRoles extends User{
    detailedRoles: Role[];
}
