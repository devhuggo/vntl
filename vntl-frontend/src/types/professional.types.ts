export interface Professional {
  id: number;
  nome: string;
  cpf: string;
  telefone?: string;
  telefoneSecundario?: string;
  email?: string;
  pacientesIds?: number[];
  pacientesCount?: number;
  dataRegistro: string;
  ativo: boolean;
  observacoes?: string;
}

export interface ProfessionalRequest {
  nome: string;
  cpf: string;
  telefone?: string;
  telefoneSecundario?: string;
  email?: string;
  ativo: boolean;
  observacoes?: string;
}
