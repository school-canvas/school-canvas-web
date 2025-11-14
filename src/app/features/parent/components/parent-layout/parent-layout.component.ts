import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-parent-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './parent-layout.component.html',
  styleUrl: './parent-layout.component.css'
})
export class ParentLayoutComponent {

}
