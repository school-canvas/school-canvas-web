import { Injectable } from '@angular/core'
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs'
import { User } from '../models/user.model'
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthRequest, AuthResponse, DecodedToken, PrincipalRegistrationRequest, UserRegistrationRequest } from '../models/auth.model';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string>('');
  public userRole$ = this.userRoleSubject.asObservable();

  private readonly USERS_API = environment.apiUrls.users;
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'current_user';

  constructor(private http: HttpClient, private router:Router) {
    this.initializeFormStorage();
  }

  private initializeFormStorage():void{
    const token = localStorage.getItem(this.TOKEN_KEY);
    if(token){
      try{
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now()

        if(decoded.exp > currentTime){
          this.isLoggedInSubject.next(true);
          
          // Set user role if available
          if (decoded.roles && decoded.roles.length > 0) {
            this.userRoleSubject.next(decoded.roles[0]);
          }
          
          // Todo: fetch full user details here
          // and update currentUserSubject
      }else{
        //Token expired
        this.logout();
      }
    }
      catch(error){
        console.error('Error parsing user from localstorage:',error);
        this.logout();
      }
    }
  }


  login(credentials: AuthRequest): Observable<any> {
    console.log('Attempting Login...')
    return this.http.post<AuthResponse>(`${this.USERS_API}/auth/login`, credentials).pipe(
      tap(response => {
        this.handleAuthResponse(response)}),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error?.message || 'Login failed'));
      })
    );
  }

  registerPrincipal(request:PrincipalRegistrationRequest):Observable<User>{
    const headers = {'X-Tenant-ID':request.tenantId};
    return this.http.post<User>(`${this.USERS_API}/auth/register/principal`,request, {headers})
    .pipe(
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Principal registration failed'));
      })
    );
  }

  registerUser(request: UserRegistrationRequest): Observable<User> {
    return this.http.post<User>(`${this.USERS_API}/auth/register/user`, request)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'User registration failed'));
        })
      );
  }

  approveUser(userId: string, tenantId: string): Observable<User> {
    const headers = new HttpHeaders({
      'X-Tenant-ID': tenantId
    });
    
    return this.http.patch<User>(`${this.USERS_API}/auth/${userId}/approve`, {}, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to approve user'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.userRoleSubject.next('');
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response && response.token) {
      localStorage.setItem('token', response.token);
      //Store tenantId if available
    if (response.tenantId) {
      localStorage.setItem('tenantId', response.tenantId);
      console.log('Tenant ID stored:', response.tenantId);
    }
      this.isLoggedInSubject.next(true);
      
      try {
        const decoded = jwtDecode<DecodedToken>(response.token);
        console.log('Decoded token roles:', decoded.roles);
        if (decoded.roles && decoded.roles.length > 0) {
          // Assuming the first role is the primary role
          this.userRoleSubject.next(decoded.roles[0]);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // If the response includes user info, update the current user
      if (response.user) {
        this.currentUserSubject.next(response.user);
      }
    }
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
      
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  getUserRole(): string {
    const token = this.getToken();
    if (!token) return '';
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.roles && decoded.roles.length > 0 ? decoded.roles[0] : '';
    } catch (error) {
      return '';
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roleName:string) : boolean{
    const user = this.getCurrentUser();
  return user ? user.roles.some(role => role.name === roleName) : false;
  }

  isPrincipal():boolean{
    return this.hasRole('PRINCIPAL')
  }

  getToken() : string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean{
    return !!localStorage.getItem(this.TOKEN_KEY);

  }

}

