export const StatusAparelho = {
  ESTOQUE: 'ESTOQUE',
  EM_USO: 'EM_USO',
  MANUTENCAO: 'MANUTENCAO',
  INATIVO: 'INATIVO'
} as const;

export type StatusAparelho = typeof StatusAparelho[keyof typeof StatusAparelho];

export interface Aparelho {
  id: number;
  numeroPatrimonio: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  dataCompra: string;
  status: StatusAparelho;
  pacienteId?: number;
  pacienteNome?: string;
  observacoes?: string;
}

export interface AparelhoRequest {
  numeroPatrimonio: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  dataCompra: string;
  status: StatusAparelho;
  pacienteId?: number;
  observacoes?: string;
}