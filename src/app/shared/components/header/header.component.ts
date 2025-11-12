import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { appConfig } from '../../../app.config';
import { ApplicationConfig } from '../../../../application-config';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../features/auth/state/auth.selectors';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, MaterialModule, MatMenuModule, MatBadgeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  implements OnInit {
  appConfig = ApplicationConfig;
  isLoggedIn = false;
  userRole = '';
  user$: Observable<User | null>;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private store: Store
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });

    this.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getUserName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return 'User';
  }

  getUserInitials(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  getRoleName(): string {
    switch (this.userRole) {
      case this.appConfig.roles.PRINCIPAL:
        return 'Principal';
      case this.appConfig.roles.TEACHER:
        return 'Teacher';
      case this.appConfig.roles.STUDENT:
        return 'Student';
      case this.appConfig.roles.PARENT:
        return 'Parent';
      default:
        return 'User';
    }
  }
}
