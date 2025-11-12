import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Tenant Interceptor - Automatically adds X-Tenant-ID header to all API requests
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = localStorage.getItem(environment.tenant.storageKey);
  
  // Skip adding tenant header for tenant creation endpoint
  const skipTenantEndpoints = ['/api/v1/tenants/create'];
  const shouldSkipTenant = skipTenantEndpoints.some(endpoint => req.url.includes(endpoint));
  
  if (tenantId && !shouldSkipTenant) {
    req = req.clone({
      setHeaders: {
        [environment.tenant.headerKey]: tenantId
      }
    });
  }
  
  return next(req);
};
