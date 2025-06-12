export interface JwtPayload {
    id: string;
    email: string;
  }
  
  export interface UserResponse {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  }
  
  export interface SignupResponse {
    message: string;
    token: string;
    user: UserResponse;
  }