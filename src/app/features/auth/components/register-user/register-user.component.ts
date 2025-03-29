import { ApplicationInitStatus, Component, OnInit } from '@angular/core'
import { SharedModule } from '../../../../shared/shared.module'
import { ApplicationConfig } from '../../../../../application-config'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { AuthService } from '../../../../core/services/auth.service'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-register-user',
  imports: [SharedModule],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css',
})
export class RegisterUserComponent implements OnInit{
  appConfig = ApplicationConfig
  registerForm!: FormGroup
  isLoading = false
  hidePassword: boolean = true
  roles = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'PARENT', label: 'Parent' },
  ]

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}
  ngOnInit(): void {
   this.initForm();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      tenantId: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      roles: [[], [Validators.required]]
    })
  }

  onSubmit(): void{
    if(this.registerForm.invalid){
      return
    }
    this.isLoading = true
    const formValue = this.registerForm.value;
    const request = {
      ...formValue,
      roles: Array.isArray(formValue.roles) ? formValue.roles : [formValue.roles]
    };
    
    this.authService.registerUser(request)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(
            'Registration successful. Your account is pending approval by the principal.', 
            'Close', 
            { duration: 8000 }
          );
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Registration failed.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
}
