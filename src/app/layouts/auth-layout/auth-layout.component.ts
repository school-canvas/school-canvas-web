import { Component, OnInit } from '@angular/core';
import { ApplicationConfig } from '../../../application-config';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-auth-layout',
  imports: [SharedModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent {
  appConfig = ApplicationConfig;
  currentYear = new Date().getFullYear();
}
