import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationConfig } from '../../../../../application-config';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-principal-dashboard',
  imports: [SharedModule],
  templateUrl: './principal-dashboard.component.html',
  styleUrl: './principal-dashboard.component.css'
})
export class PrincipalDashboardComponent {

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
    console.log('loadUsers method called');
  this.isLoadingUsers = true;
  
  // Log authentication state
  console.log('Auth token exists:', !!localStorage.getItem('token'));
  console.log('Tenant ID:', localStorage.getItem('tenantId'));
  
  this.userService.getAllUsers().subscribe({
    next: (users) => {
      console.log('Users received successfully:', users);
      console.log('Number of users:', users.length);
      console.log('First user sample:', users.length > 0 ? JSON.stringify(users[0], null, 2) : 'No users');
      this.allUsers = users;
      this.pendingUsers = this.allUsers.filter(user => !user.active);
      console.log('Pending users count:', this.pendingUsers.length);
      this.isLoadingUsers = false;
    },
    error: (error) => {
      console.error('Error in component when loading users:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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
