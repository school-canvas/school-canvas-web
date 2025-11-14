export interface Book {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  authorId: string;
  publisherId: string;
  categoryId: string;
  edition?: string;
  publicationYear?: number;
  language?: string;
  pages?: number;
  description?: string;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  authorName?: string;
  publisherName?: string;
  categoryName?: string;
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  tenantId: string;
}

export interface Publisher {
  id: string;
  name: string;
  address?: string;
  tenantId: string;
}

export interface BookCategory {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
}

export interface Borrowing {
  id: string;
  bookCopyId: string;
  studentId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowingStatus;
  fineAmount?: number;
  remarks?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  bookTitle?: string;
  studentName?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
}

export enum BorrowingStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED'
}

export interface CheckoutBookRequest {
  bookCopyId: string;
  studentId: string;
  dueDate: string;
}

export interface ReturnBookRequest {
  fineAmount?: number;
  remarks?: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  studentId: string;
  reservationDate: string;
  status: ReservationStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}
