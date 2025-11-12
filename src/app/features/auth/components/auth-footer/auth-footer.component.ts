import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationConfig } from '../../../../../application-config';

@Component({
  selector: 'app-auth-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-footer.component.html',
  styleUrl: './auth-footer.component.css'
})
export class AuthFooterComponent {
  appConfig = ApplicationConfig;
  currentYear = new Date().getFullYear();
}
