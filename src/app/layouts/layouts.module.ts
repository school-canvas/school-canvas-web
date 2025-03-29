import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    MainLayoutComponent,
    AuthLayoutComponent
  ],
  exports: [
    MainLayoutComponent,
    AuthLayoutComponent,
    SharedModule,
  ],
})
export class LayoutsModule { }
