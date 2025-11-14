import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../../shared/shared.module';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state/auth.selectors';
import { Observable } from 'rxjs';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  user$: Observable<User | null>;
  currentUser: User | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.initForm();
    this.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private initForm() {
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [this.passwordMatchValidator, this.differentPasswordValidator] });
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
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Custom validator to ensure new password is different from current
  differentPasswordValidator(group: AbstractControl): ValidationErrors | null {
    const currentPassword = group.get('currentPassword')?.value;
    const newPassword = group.get('newPassword')?.value;
    return currentPassword === newPassword ? { samePassword: true } : null;
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.isLoading = true;

    // TODO: Backend Integration - Change password for logged-in user
    // API Endpoint: POST /api/v1/users/change-password
    // Headers: Authorization: Bearer {token}
    // Request Body: { 
    //   userId: UUID,
    //   currentPassword: string, 
    //   newPassword: string 
    // }
    // Response: { success: boolean, message: string }
    
    const { currentPassword, newPassword } = this.changePasswordForm.value;

    // Simulating API call
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open(
        'Password changed successfully! Please login with your new password.',
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      
      // Optionally logout user and redirect to login
      // this.authFacade.logout();
      // this.router.navigate(['/auth/login']);
      
      // Or just reset the form
      this.changePasswordForm.reset();
    }, 2000);
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  getPasswordStrengthColor(): string {
    const password = this.changePasswordForm.get('newPassword')?.value;
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
