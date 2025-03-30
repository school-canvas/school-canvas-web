
import { HttpInterceptorFn } from "@angular/common/http";


// auth.interceptor.ts

export const authInterceptor: HttpInterceptorFn = (req,next) => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  
  // Clone the request with new headers
  if (token || tenantId) {
    let headers = req.headers;
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (tenantId) {
      headers = headers.set('X-Tenant-ID', tenantId);
    }
    
    const authReq = req.clone({ headers });

    
    return next(authReq);
  }
  
  return next(req);
}

