import { NgModule } from "@angular/core";
import { Routes,RouterModule } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { RegisterPrincipalComponent } from "./components/register-principal/register-principal.component";
import { RegisterUserComponent } from "./components/register-user/register-user.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { ChangePasswordComponent } from "./components/change-password/change-password.component";

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register-principal', component: RegisterPrincipalComponent },
    { path: 'register-user', component: RegisterUserComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'change-password', component: ChangePasswordComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }