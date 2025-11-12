import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MaterialModule } from '../../material.module'
import { ApplicationConfig } from '../../../../application-config'

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  appConfig = ApplicationConfig
  currentYear = new Date().getFullYear()
}
