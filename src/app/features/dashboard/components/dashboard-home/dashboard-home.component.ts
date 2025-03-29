import { Component, OnInit } from '@angular/core';
import { DashboardModule } from '../../dashboard.module';
import { ApplicationConfig } from '../../../../../application-config';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-dashboard-home',
  imports: [SharedModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {
  userRole = '';
  userName = '';
  appConfig = ApplicationConfig;
  constructor(private authService : AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
      this.redirectBasedOnRole();
    }
    );
  }

  private redirectBasedOnRole(){
    setTimeout(() => {
      if (this.userRole === this.appConfig.roles.PRINCIPAL) {
        this.router.navigate(['/dashboard/principal']);
      } else if (this.userRole === this.appConfig.roles.TEACHER) {
        this.router.navigate(['/dashboard/teacher']);
      } else if (this.userRole === this.appConfig.roles.STUDENT) {
        this.router.navigate(['/dashboard/student']);
      }
    }, 1000);
  }

}
