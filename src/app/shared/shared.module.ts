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
import { MatTableModule } from '@angular/material/table';



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
    MatTableModule
  ],
  exports: [
    SafeResourceUrlPipe,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatMenuModule,
    RouterModule,
    FormsModule,
    MatTableModule,
  ]
})
export class SharedModule { }
