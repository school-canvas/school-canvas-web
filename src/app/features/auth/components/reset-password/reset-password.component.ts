import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationConfig } from '../../../../../application-config';
import { AuthFooterComponent } from '../auth-footer/auth-footer.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, SharedModule, AuthFooterComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  resetToken: string | null = null;
  tokenValid = true;
  appConfig = ApplicationConfig;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.resetToken) {
      this.tokenValid = false;
      this.snackBar.open('Invalid reset link', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // TODO: Backend Integration - Validate reset token
    // API Endpoint: GET /api/v1/auth/verify-reset-token?token={token}
    // Response: { valid: boolean, email: string }
    
    this.initForm();
  }

  private initForm() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  // Custom validator for password match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.resetToken) {
      return;
    }

    this.isLoading = true;

    // TODO: Backend Integration - Reset password
    // API Endpoint: POST /api/v1/auth/reset-password
    // Request Body: { token: string, newPassword: string }
    // Response: { success: boolean, message: string }
    
    const { password } = this.resetPasswordForm.value;

    // Simulating API call
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open(
        'Password reset successful! Please login with your new password.',
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  getPasswordStrengthColor(): string {
    const password = this.resetPasswordForm.get('password')?.value;
    if (!password) return '';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumeric, hasSpecialChar].filter(Boolean).length;

    if (strength <= 1) return 'weak';
    if (strength === 2) return 'medium';
    if (strength === 3) return 'good';
    return 'strong';
  }
}
