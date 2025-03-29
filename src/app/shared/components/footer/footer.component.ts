import { Component } from '@angular/core'
import { ApplicationConfig } from '../../../../application-config'
import { SharedModule } from '../../shared.module'

@Component({
  selector: 'app-footer',
  imports: [SharedModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  appConfig = ApplicationConfig
  currentYear = new Date().getFullYear()
}
