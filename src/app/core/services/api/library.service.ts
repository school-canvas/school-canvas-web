import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Book, Borrowing, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private apiUrl = environment.apiUrls.library;

  constructor(private http: HttpClient) {}

  getAllBooks(page: number = 0, size: number = 20): Observable<PageResponse<Book>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Book>>(
      `${this.apiUrl}/books/fetchAll`,
      { params }
    );
  }

  getBookById(bookId: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${bookId}`);
  }

  searchBooks(query: string, page: number = 0, size: number = 20): Observable<PageResponse<Book>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Book>>(
      `${this.apiUrl}/books/search`,
      { params }
    );
  }

  borrowBook(bookId: string, userId: string): Observable<Borrowing> {
    return this.http.post<Borrowing>(`${this.apiUrl}/borrowings/borrow`, {
      bookId,
      userId
    });
  }

  returnBook(borrowingId: string): Observable<Borrowing> {
    return this.http.put<Borrowing>(`${this.apiUrl}/borrowings/${borrowingId}/return`, {});
  }

  getBorrowingsByUser(userId: string, page: number = 0, size: number = 20): Observable<PageResponse<Borrowing>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Borrowing>>(
      `${this.apiUrl}/borrowings/user/${userId}`,
      { params }
    );
  }
}
