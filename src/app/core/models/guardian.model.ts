export interface Guardian {
  id: string;
  userId: string;
  relation: GuardianRelation;
  occupation?: string;
  workAddress?: string;
  officePhone?: string;
  annualIncome?: number;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated from User
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export enum GuardianRelation {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  LEGAL_GUARDIAN = 'LEGAL_GUARDIAN',
  GRANDFATHER = 'GRANDFATHER',
  GRANDMOTHER = 'GRANDMOTHER',
  OTHER = 'OTHER'
}

export interface StudentGuardian {
  id: string;
  studentId: string;
  guardianId: string;
  relation: GuardianRelation;
  isPrimary: boolean;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}
