import { Component, OnInit } from '@angular/core'
import { SharedModule } from '../../../../shared/shared.module'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthFacade } from '../../state/auth.facade'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ApplicationConfig } from '../../../../../application-config'
import { CommonModule } from '@angular/common'
import { Observable } from 'rxjs'
import { AuthFooterComponent } from '../auth-footer/auth-footer.component'

@Component({
  selector: 'app-login',
  imports: [SharedModule, CommonModule, AuthFooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  isLoading$!: Observable<boolean>
  hidePassword: boolean = true
  redirectUrl: string | null = null
  appConfig = ApplicationConfig

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public authFacade: AuthFacade,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.isLoading$ = this.authFacade.loading$

    this.redirectUrl =
      this.route.snapshot.queryParams['redirectUrl'] || '/dashboard'

    // Subscribe to error state to show error messages
    this.authFacade.error$.subscribe((error) => {
      if (error) {
        this.snackBar.open(
          error || 'Login failed. Please check your credentials.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          },
        )
        this.authFacade.clearError()
      }
    })

    // Subscribe to authentication state to redirect after successful login
    this.authFacade.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.router.navigateByUrl(this.redirectUrl || '/dashboard')
      }
    })
  }

  private initForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    })
  }

  get f() {
    return this.loginForm.controls
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return
    }

    // Dispatch login action through facade
    this.authFacade.login(this.loginForm.value)
  }
}
