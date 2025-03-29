import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { routes } from '../app.routes';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SafeResourceUrlPipe } from './pipes/safe-resource-url.pipe';



@NgModule({
  declarations: [
    SafeResourceUrlPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
  ],
  exports: [
    SafeResourceUrlPipe,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatMenuModule,
  ]
})
export class SharedModule { }
