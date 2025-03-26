import { NgModule } from "@angular/core";
import { Routes,RouterModule } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { RegisterPrincipalComponent } from "./components/register-principal/register-principal.component";
import { RegisterUserComponent } from "./components/register-user/register-user.component";

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register/principal', component: RegisterPrincipalComponent },
    { path: 'register/user', component: RegisterUserComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }