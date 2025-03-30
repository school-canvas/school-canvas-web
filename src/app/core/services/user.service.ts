import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly USERS_API = environment.apiUrls.users;

  constructor(private http: HttpClient) { }

  getAllUsers() : Observable<User[]>{
    console.log('getAllUsers called');
    const tenantId = localStorage.getItem('tenantId');
    console.log('Tenant ID from localStorage:', tenantId);
    const headers = new HttpHeaders({
      'X-Tenant-ID': tenantId || ''
    });

    console.log('Request headers:', headers);
  console.log('Making API request to:', `${this.USERS_API}/user/fetchAllUsers`);

return this.http.get<User[]>(`${this.USERS_API}/user/fetchAllUsers`, {headers})
.pipe(
  tap(response => console.log('API response received:', response)),
  catchError(error => {
    console.error('API error details:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error body:', error.error);
      return throwError(() => new Error(error.error?.message||'Failed to fetch users'));
    })
  )
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.USERS_API}/user/${userId}`)
    .pipe(catchError(error => throwError(() => new Error(error.error?.message||'Failed to fetch user'))));
      
  }

  approveUser(userId: string, tenantId: string): Observable<User> {
    const headers = new HttpHeaders({
      'X-Tenant-ID': tenantId
    });
    return this.http.patch<User>(`${this.USERS_API}/auth/${userId}/approve`, { headers })
      .pipe(catchError(error => throwError(() => new Error(error.error?.message || 'Failed to approve user'))));
  }
}



