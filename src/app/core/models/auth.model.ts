import { User } from "./user.model";

export interface AuthRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    tokenType: string;
    username: string;
    roles: string[];
    permissions: string[];
    tenantId: string;
    user?:User
  }
  
  export interface PrincipalRegistrationRequest {
    tenantId: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  
  export interface UserRegistrationRequest {
    tenantId: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  }

  export interface DecodedToken{
    sub: string;
    roles: string[];
    // tenantId: string;
    exp: number;
    [key: string]: any;
  }