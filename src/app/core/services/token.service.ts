import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;  // userId
  email: string;
  roles: string[];
  tenantId: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  /**
   * Store JWT token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(environment.jwt.tokenKey, token);
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(environment.jwt.tokenKey);
  }

  /**
   * Remove JWT token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem(environment.jwt.tokenKey);
  }

  /**
   * Decode JWT token and return payload
   */
  decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) {
      return true;
    }

    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate < new Date();
  }

  /**
   * Get token expiration date
   */
  getTokenExpiration(): Date | null {
    const payload = this.decodeToken();
    if (!payload) {
      return null;
    }

    return new Date(payload.exp * 1000);
  }

  /**
   * Get user ID from token
   */
  getUserId(): string | null {
    const payload = this.decodeToken();
    return payload?.sub || null;
  }

  /**
   * Get user email from token
   */
  getUserEmail(): string | null {
    const payload = this.decodeToken();
    return payload?.email || null;
  }

  /**
   * Get user roles from token
   */
  getUserRoles(): string[] {
    const payload = this.decodeToken();
    return payload?.roles || [];
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  /**
   * Get tenant ID from token
   */
  getTenantId(): string | null {
    const payload = this.decodeToken();
    return payload?.tenantId || null;
  }

  /**
   * Check if token needs refresh (expires in less than 1 hour)
   */
  shouldRefreshToken(): boolean {
    const expirationDate = this.getTokenExpiration();
    if (!expirationDate) {
      return false;
    }

    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    return expirationDate < oneHourFromNow;
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    localStorage.removeItem(environment.jwt.tokenKey);
    localStorage.removeItem(environment.tenant.storageKey);
    localStorage.removeItem('user_data');
  }

  // Alias methods for consistency with NgRx effects
  saveToken(token: string): void {
    this.setToken(token);
  }

  saveTenantId(tenantId: string): void {
    localStorage.setItem(environment.tenant.storageKey, tenantId);
  }

  getDecodedToken(): JwtPayload | null {
    return this.decodeToken();
  }

  getUser(): any {
    const payload = this.decodeToken();
    if (!payload) return null;
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.roles?.[0] || 'USER',
      roles: payload.roles,
      tenantId: payload.tenantId
    };
  }

  clearAll(): void {
    this.clearAuth();
  }
}
