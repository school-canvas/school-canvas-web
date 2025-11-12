export interface Invoice {
  id: string;
  studentId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  description?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  studentName?: string;
  items?: InvoiceItem[];
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  studentId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  remarks?: string;
  receivedBy: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  studentName?: string;
  invoiceNumber?: string;
  receivedByName?: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ONLINE = 'ONLINE',
  OTHER = 'OTHER'
}

export interface RecordPaymentRequest {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  remarks?: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  description?: string;
  gradeLevel?: string;
  academicYear: string;
  status: FeeStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum FeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface FeeCategory {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: FeeFrequency;
  tenantId: string;
}

export enum FeeFrequency {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL'
}
