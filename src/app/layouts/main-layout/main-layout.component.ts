import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AuthModule } from '../../features/auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [SharedModule,HeaderComponent,FooterComponent,RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  isSidebarCollapsed = false;

  constructor() {}

  ngOnInit(): void {

  }

  toggleSideBar() : void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onSideBarToggle(event : Event): void{
    const customEvent = event as CustomEvent;
    this.isSidebarCollapsed = customEvent.detail;
  }
}
