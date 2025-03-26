import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { User } from '../models/user.model'
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthRequest, AuthResponse, PrincipalRegistrationRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly USERS_API = environment.apiUrls.users;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  constructor(private http: HttpClient, private router:RouterModule) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage():void{
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    if(token && user){
      try{
        this.currentUserSubject.next(JSON.parse(user));
      }catch(error){
        console.error('Error parsing user from localstorage:',error)
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
      }
    }else{
      this.currentUserSubject.next(null);
    }
  }

  login(credentials: AuthRequest): Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.USERS_API}/auth/login`,credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY,response.accessToken);
        localStorage.setItem(this.USER_KEY,JSON.stringify(response.user));
        this.currentUserSubject.next(response.user as User);
      })
    );
  }

  registerPrincipal(request:PrincipalRegistrationRequest):Observable<User>{
    const headers = {'X-Tenant-ID':request.tenantId};
    return this.http.post<User>(`${this.USERS_API}/register/principal`,request, {headers});
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role:string) : boolean{
    const user = this.getCurrentUser();
    return user ? user.roles.includes(role) : false
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
