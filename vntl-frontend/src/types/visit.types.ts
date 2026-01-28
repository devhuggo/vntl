export const VisitStatus = {
  AGENDADA: 'AGENDADA',
  CONFIRMADA: 'CONFIRMADA',
  REALIZADA: 'REALIZADA',
  CANCELADA: 'CANCELADA',
  REMARCADA: 'REMARCADA'
} as const;

export const VisitType = {
  VERIFICACAO: 'VERIFICACAO',
  MANUTENCAO: 'MANUTENCAO',
  TROCA: 'TROCA',
  INSTALACAO: 'INSTALACAO'
} as const;

export type VisitStatus = typeof VisitStatus[keyof typeof VisitStatus];
export type VisitType = typeof VisitType[keyof typeof VisitType];

export interface Visit {
  id: number;
  pacienteId: number;
  pacienteNome?: string;
  profissionalId: number;
  profissionalNome?: string;
  aparelhoId?: number;
  aparelhoNumeroPatrimonio?: string;
  dataVisita: string;
  dataHoraConcluida?: string;
  status: VisitStatus;
  observacoes?: string;
  tipoVisita: VisitType;
  proximaVisita?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface VisitRequest {
  pacienteId: number;
  profissionalId: number;
  aparelhoId?: number;
  dataVisita: string;
  status: VisitStatus;
  observacoes?: string;
  tipoVisita: VisitType;
  proximaVisita?: string;
}

