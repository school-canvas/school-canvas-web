import { Component, OnInit } from '@angular/core'
import { SharedModule } from '../../../../shared/shared.module'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../../../../core/services/auth.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { first } from 'rxjs'
import { ApplicationConfig } from '../../../../../application-config'

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  isLoading = false
  hidePassword : boolean = true
  redirectUrl: string | null = null
  appConfig = ApplicationConfig

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initForm()

    this.redirectUrl =
      this.route.snapshot.queryParams['redirectTo'] || '/dashboard'
  }

  private initForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  get f() {
    return this.loginForm.controls
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return
    }

    this.isLoading = true

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login response:', response)
        this.router.navigateByUrl(this.redirectUrl || '/dashboard')
      },
      error: (error) => {
        this.isLoading = false
        this.snackBar.open(
          error.message || 'Login failed. Please check your credentials.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          },
        )
      },
    })
  }
}
