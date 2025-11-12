import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { AuthFacade } from './features/auth/state/auth.facade';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'school-canvas-web';

  constructor(private authFacade: AuthFacade) {}

  ngOnInit(): void {
    // Check if user is already authenticated on app startup
    this.authFacade.checkAuthStatus();
  }
}

