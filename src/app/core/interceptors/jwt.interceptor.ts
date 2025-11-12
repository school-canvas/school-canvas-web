import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * JWT Interceptor - Automatically adds JWT token to all API requests
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(environment.jwt.tokenKey);
  
  // Skip adding token for public endpoints
  const publicEndpoints = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/tenants/exists'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  if (token && !isPublicEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
