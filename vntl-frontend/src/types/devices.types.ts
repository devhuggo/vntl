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
  /** ISO date (yyyy-mm-dd) ou null quando não há troca registrada */
  dataUltimaTroca?: string | null;
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
  dataUltimaTroca?: string | null;
  status: StatusAparelho;
  pacienteId?: number;
  observacoes?: string;
}

export interface DeviceListFilters {
  dataCompraDe?: string;
  dataCompraAte?: string;
  dataUltimaTrocaDe?: string;
  dataUltimaTrocaAte?: string;
}