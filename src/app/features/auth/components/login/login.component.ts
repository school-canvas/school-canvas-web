import { Component, OnInit } from '@angular/core'
import { SharedModule } from '../../../../shared/shared.module'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../../../../core/services/auth.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { first } from 'rxjs'

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  providers : [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  loading = false
  submitted = false
  error = ''
  returnUrl: string = '/dashboard'

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar : MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['',Validators.required],
      password: ['',Validators.required]
    });

    //Get return url from route parameters or default to /dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    //Redirect if already logged in
    if(this.authService.isLoggedIn()){
      this.router.navigate([this.returnUrl]);
    }
  }

  get f(){
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if(this.loginForm.invalid){
      return;
    }
    this.loading = true;
    this.authService.login({
      username : this.f['username'].value,
      password : this.f['password'].value
    }).pipe(first())
    .subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error : error => {
        this.error = error.error?.message || 'Invalid Credentials';
        this.snackBar.open(this.error, 'Close', {
          duration : 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.loading = false;
      }
    })
  }
}
