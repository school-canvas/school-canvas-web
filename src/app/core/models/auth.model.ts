export interface AuthRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      roles: string[];
    };
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