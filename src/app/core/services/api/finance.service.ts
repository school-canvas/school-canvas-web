import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Invoice, Payment, FeeStructure, RecordPaymentRequest, PageResponse } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private apiUrl = environment.apiUrls.finance;

  constructor(private http: HttpClient) {}

  // Invoice operations
  createInvoice(request: any): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices/create`, request);
  }

  getInvoiceById(invoiceId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${invoiceId}`);
  }

  getInvoicesByStudent(studentId: string, page: number = 0, size: number = 20): Observable<PageResponse<Invoice>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Invoice>>(
      `${this.apiUrl}/invoices/student/${studentId}`,
      { params }
    );
  }

  getAllInvoices(page: number = 0, size: number = 20): Observable<PageResponse<Invoice>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Invoice>>(
      `${this.apiUrl}/invoices/fetchAll`,
      { params }
    );
  }

  // Payment operations
  createPayment(request: RecordPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/create`, request);
  }

  getPaymentsByStudent(studentId: string, page: number = 0, size: number = 20): Observable<PageResponse<Payment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Payment>>(
      `${this.apiUrl}/payments/student/${studentId}`,
      { params }
    );
  }

  // Fee Structure operations
  getAllFeeStructures(page: number = 0, size: number = 20): Observable<PageResponse<FeeStructure>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<FeeStructure>>(
      `${this.apiUrl}/fee-structures/fetchAll`,
      { params }
    );
  }
}
