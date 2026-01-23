export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nome: string;
  role: string;
}

export interface User {
  username: string;
  nome: string;
  role: string;
}