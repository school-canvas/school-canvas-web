import { Component, OnInit } from '@angular/core';
import { ApplicationConfig } from '../../../../../application-config';
import { SharedModule } from '../../../../shared/shared.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [SharedModule],
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
