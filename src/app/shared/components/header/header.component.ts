import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { appConfig } from '../../../app.config';
import { ApplicationConfig } from '../../../../application-config';

@Component({
  selector: 'app-header',
  imports: [SharedModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  implements OnInit {
  appConfig = ApplicationConfig;
  isLoggedIn = false;
  userRole = '';
  constructor(private authService:AuthService, private router:Router) { }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  navigateToLogin(){
    console.log("Navigating to login");
    this.router.navigate(['/auth/login']);
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/']);
  }


}
