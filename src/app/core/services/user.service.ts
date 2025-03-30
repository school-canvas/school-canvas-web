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
    const tenantId = localStorage.getItem('tenantId');
    const headers = new HttpHeaders({
      'X-Tenant-ID': tenantId || ''
    });

return this.http.get<User[]>(`${this.USERS_API}/user/fetchAllUsers`, {headers})
.pipe(
  tap(response => console.log('API response received:', response)),
  catchError(error => {
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



