export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nome: string;
  role: string;
  professionalId?: number | null;
}

export interface User {
  username: string;
  nome: string;
  role: string;
  /** Profissional vinculado à conta (visitas e pacientes são atribuídos a este ID). */
  professionalId?: number | null;
}