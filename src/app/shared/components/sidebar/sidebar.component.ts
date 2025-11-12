import { Component, EventEmitter, Output } from '@angular/core';
import { ApplicationConfig } from '../../../../application-config';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-sidebar',
  imports: [SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  @Output() toggleSideBarEvent = new EventEmitter<boolean>();

  collapsed = false;
  userRoles: string[] = [];
  appName = ApplicationConfig.appName;
  // menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // ngOnInit(): void {
  //   this.loadUserRoles();
  //   // this.initializeMenu();
  // }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.toggleSideBarEvent.emit(this.collapsed);
  }

  // toggleSubMenu(item: MenuItem): void {
  //   item.expanded = !item.expanded;
  // }

  loadUserRoles(): void {
  
  }
}
