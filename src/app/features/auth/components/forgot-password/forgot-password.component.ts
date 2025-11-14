import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationConfig } from '../../../../../application-config';
import { AuthFooterComponent } from '../auth-footer/auth-footer.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, SharedModule, AuthFooterComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  emailSent = false;
  appConfig = ApplicationConfig;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email;

    // TODO: Backend Integration - Send password reset email
    // API Endpoint: POST /api/v1/auth/forgot-password
    // Request Body: { email: string }
    // Response: { success: boolean, message: string }
    
    // Simulating API call
    setTimeout(() => {
      this.isLoading = false;
      this.emailSent = true;
      this.snackBar.open(
        'Password reset link has been sent to your email!',
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
    }, 2000);
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
