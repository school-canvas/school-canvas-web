import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, take, debounceTime } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StudentService } from '../../../../core/services/student.service';
import { selectUser } from '../../../auth/state/auth.selectors';

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher?: string;
  publishedYear?: number;
  description?: string;
  coverImage?: string;
  availableCopies: number;
  totalCopies: number;
  shelfLocation?: string;
}

interface BorrowedBook {
  id: string;
  bookId: string;
  book: Book;
  studentId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'RENEWED';
  renewalCount: number;
  fineAmount?: number;
}

interface LibraryStats {
  totalBorrowed: number;
  currentlyBorrowed: number;
  overdue: number;
  totalFines: number;
}

@Component({
  selector: 'app-library-books',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatsCardComponent,
    EmptyStateComponent
  ],
  templateUrl: './library-books.component.html',
  styleUrl: './library-books.component.css'
})
export class LibraryBooksComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  studentId: string = '';
  selectedTab = 0;

  // Search and filters
  searchControl = new FormControl('');
  categoryFilter = new FormControl('all');
  availabilityFilter = new FormControl('all');

  // Data
  allBooks: Book[] = [];
  filteredBooks: Book[] = [];
  borrowedBooks: BorrowedBook[] = [];
  categories: string[] = ['all', 'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 'Literature', 'Technology'];
  
  stats: LibraryStats = {
    totalBorrowed: 0,
    currentlyBorrowed: 0,
    overdue: 0,
    totalFines: 0
  };

  constructor(
    private studentService: StudentService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(take(1))
      .subscribe(user => {
        if (user?.id) {
          this.studentId = user.id;
          this.loadLibraryData();
        }
      });

    // Search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    // Category filter
    this.categoryFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    // Availability filter
    this.availabilityFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLibraryData(): void {
    this.loading = true;

    // Mock library data - replace with actual API calls
    setTimeout(() => {
      this.allBooks = this.generateMockBooks();
      this.borrowedBooks = this.generateMockBorrowedBooks();
      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  generateMockBooks(): Book[] {
    const categories = ['Fiction', 'Science', 'Mathematics', 'History', 'Literature', 'Technology'];
    const books: Book[] = [];

    for (let i = 1; i <= 30; i++) {
      const category = categories[i % categories.length];
      const available = Math.floor(Math.random() * 6);
      
      books.push({
        id: `book-${i}`,
        isbn: `978-0-${1000 + i}-${Math.floor(Math.random() * 1000)}`,
        title: `${category} Book Title ${i}`,
        author: ['John Smith', 'Jane Doe', 'Robert Johnson', 'Mary Williams', 'James Brown'][i % 5],
        category,
        publisher: ['Penguin', 'HarperCollins', 'Simon & Schuster', 'Macmillan', 'Pearson'][i % 5],
        publishedYear: 2015 + (i % 10),
        description: `This is an excellent ${category.toLowerCase()} book that covers various important topics in the field.`,
        coverImage: undefined,
        availableCopies: available,
        totalCopies: available + Math.floor(Math.random() * 3),
        shelfLocation: `Section ${String.fromCharCode(65 + (i % 10))}, Shelf ${Math.floor(i / 10) + 1}`
      });
    }

    return books;
  }

  generateMockBorrowedBooks(): BorrowedBook[] {
    const borrowed: BorrowedBook[] = [];
    const today = new Date();

    for (let i = 1; i <= 5; i++) {
      const borrowDate = new Date(today);
      borrowDate.setDate(today.getDate() - (i * 7));
      
      const dueDate = new Date(borrowDate);
      dueDate.setDate(borrowDate.getDate() + 14);
      
      const isOverdue = dueDate < today;
      const book = this.allBooks[i - 1];

      borrowed.push({
        id: `borrow-${i}`,
        bookId: book.id,
        book,
        studentId: this.studentId,
        borrowDate: borrowDate.toISOString(),
        dueDate: dueDate.toISOString(),
        returnDate: i > 3 ? undefined : new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        status: i > 3 ? (isOverdue ? 'OVERDUE' : 'BORROWED') : 'RETURNED',
        renewalCount: Math.floor(Math.random() * 2),
        fineAmount: isOverdue && i > 3 ? (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24) * 0.5 : 0
      });
    }

    return borrowed;
  }

  calculateStats(): void {
    const currentlyBorrowed = this.borrowedBooks.filter(b => b.status === 'BORROWED' || b.status === 'OVERDUE');
    const overdue = this.borrowedBooks.filter(b => b.status === 'OVERDUE');
    const totalFines = this.borrowedBooks.reduce((sum, b) => sum + (b.fineAmount || 0), 0);

    this.stats = {
      totalBorrowed: this.borrowedBooks.length,
      currentlyBorrowed: currentlyBorrowed.length,
      overdue: overdue.length,
      totalFines
    };
  }

  applyFilters(): void {
    let filtered = [...this.allBooks];

    // Search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    const category = this.categoryFilter.value;
    if (category && category !== 'all') {
      filtered = filtered.filter(book => book.category === category);
    }

    // Availability filter
    const availability = this.availabilityFilter.value;
    if (availability === 'available') {
      filtered = filtered.filter(book => book.availableCopies > 0);
    } else if (availability === 'unavailable') {
      filtered = filtered.filter(book => book.availableCopies === 0);
    }

    this.filteredBooks = filtered;
  }

  borrowBook(book: Book): void {
    console.log('Borrow book:', book.title);
    // TODO: Implement borrow functionality
  }

  renewBook(borrowedBook: BorrowedBook): void {
    console.log('Renew book:', borrowedBook.book.title);
    // TODO: Implement renew functionality
  }

  returnBook(borrowedBook: BorrowedBook): void {
    console.log('Return book:', borrowedBook.book.title);
    // TODO: Implement return functionality
  }

  getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: string): boolean {
    return this.getDaysUntilDue(dueDate) < 0;
  }

  getDueDateText(dueDate: string): string {
    const days = this.getDaysUntilDue(dueDate);
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${days} days`;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.categoryFilter.setValue('all');
    this.availabilityFilter.setValue('all');
  }
}
