export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  organizationIds?: string[];
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
  token: string;
}