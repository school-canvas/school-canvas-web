import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="error-container" *ngIf="message">
      <mat-icon>error</mat-icon>
      <span>{{ message }}</span>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      color: #c62828;
      border-radius: 4px;
      margin: 16px 0;
    }

    mat-icon {
      color: #f44336;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message: string = '';
}
