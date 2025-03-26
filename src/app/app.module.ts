import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { CoreModule } from './core/core.module'
import { LayoutsModule } from './layouts/layouts.module'
import { SharedModule } from './shared/shared.module'

// Angular Material
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { RouterModule } from '@angular/router'
import { AuthModule } from './features/auth/auth.module'

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    LayoutsModule,
    SharedModule,
    MatSnackBarModule,
    RouterModule.forRoot([]),
    AuthModule,
    AppComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
