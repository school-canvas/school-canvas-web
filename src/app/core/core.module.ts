import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers : [{
    provide : HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi: true, 
  }, provideHttpClient()]
})
export class CoreModule {

  constructor(@Optional() @SkipSelf() parentModule : CoreModule){
    if(parentModule){
      throw new Error('CoreModule is already loaded. Import it in AppModule only.')
    }
  }

 }
