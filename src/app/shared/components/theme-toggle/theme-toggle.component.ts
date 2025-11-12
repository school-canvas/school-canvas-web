import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <button 
      mat-icon-button 
      (click)="toggleTheme()"
      [matTooltip]="(themeService.currentTheme$ | async) === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
      <mat-icon>{{ (themeService.currentTheme$ | async) === 'light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
    </button>
  `,
  styles: []
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
