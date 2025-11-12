import { Component, OnInit } from '@angular/core';
import { ApplicationConfig } from '../../../../../application-config';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/material.module';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MaterialModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  appConfig = ApplicationConfig;
  safeMapUrl!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer,private router: Router) { }

  ngOnInit(): void {
      const mapUrl = this.appConfig.mapEmbedUrl;
      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);

  }
}
