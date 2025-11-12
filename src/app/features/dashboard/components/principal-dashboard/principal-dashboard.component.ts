import {Component, OnInit} from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationConfig } from '../../../../../application-config';
import { User } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-principal-dashboard',
  imports: [SharedModule],
  templateUrl: './principal-dashboard.component.html',
  styleUrl: './principal-dashboard.component.css'
})
export class PrincipalDashboardComponent implements OnInit{

  appConfig = ApplicationConfig;
  allUsers : User[] = [];
  isLoadingUsers = false;
  pendingUsers : User[] = [];

  displayedColumns: string[] = ['username', 'name', 'email', 'roles', 'status', 'actions'];

  constructor(private userService : UserService,
    private snackBar : MatSnackBar,

  ){
  }

  ngOnInit(){
    this.loadUsers();
  }

  loadUsers(): void {
  this.isLoadingUsers = true;

  this.userService.getAllUsers().subscribe({
    next: (users) => {
      this.allUsers = users;
      this.pendingUsers = this.allUsers.filter(user => !user.active);
      this.isLoadingUsers = false;
    },
    error: (error) => {
      this.isLoadingUsers = false;
      this.snackBar.open('Failed to load users: ' + error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

  approveUser(userId: string): void {
    // Get the tenant ID from localStorage
    const tenantId = localStorage.getItem('tenantId') || '';

    this.userService.approveUser(userId, tenantId).subscribe({
      next: (updatedUser) => {
        // Update user in the lists
        const userIndex = this.allUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          this.allUsers[userIndex] = updatedUser;
        }

        // Remove from pending users
        this.pendingUsers = this.pendingUsers.filter(u => u.id !== userId);

        this.snackBar.open('User approved successfully', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open('Failed to approve user: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  get studentCount(): number {
    return this.allUsers.filter(u => u.roles?.some(r => r.name === 'STUDENT')).length;
  }

  get teacherCount(): number {
    return this.allUsers.filter(u => u.roles?.some(r => r.name === 'TEACHER')).length;
  }

}
