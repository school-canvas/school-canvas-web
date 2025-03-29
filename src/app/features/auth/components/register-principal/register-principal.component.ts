import { Component, OnInit } from '@angular/core'
import { SharedModule } from '../../../../shared/shared.module'
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ApplicationConfig } from '../../../../../application-config'
import { AuthService } from '../../../../core/services/auth.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'

@Component({
  selector: 'app-register-principal',
  imports: [SharedModule],
  templateUrl: './register-principal.component.html',
  styleUrl: './register-principal.component.css',
})
export class RegisterPrincipalComponent implements OnInit {
  registerForm!: FormGroup
  isLoading = false
  hidePassword: boolean = true
  appCpnfig = ApplicationConfig

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
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return
    }
    this.isLoading = true
    const tenantId = this.registerForm.value.tenantId;
    const request = {
      ...this.registerForm.value
    };
    this.authService.registerPrincipal(request)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Registration successful', 'Close', {
            duration: 3000,
          })
          this.router.navigate(['/auth/login'])
        },
        error: (error) => {
          this.isLoading = false
          this.snackBar.open(error.error.message || 'Registration failed.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          })
        },
      })
    
  }
}
