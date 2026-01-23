export const PacientStatus = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  AGUARDANDO: 'AGUARDANDO',
  ALTA: 'ALTA'
} as const;

export const ContractType = {
  PREFEITURA: 'PREFEITURA',
  UNIMED: 'UNIMED',
  PARTICULAR: 'PARTICULAR',
  OUTRO: 'OUTRO'
} as const;

export type PacientStatus = typeof PacientStatus[keyof typeof PacientStatus];
export type ContractType = typeof ContractType[keyof typeof ContractType];

export interface Pacient {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento?: string;
  telefone?: string;
  telefoneSecundario?: string;
  email?: string;
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoComplemento?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCep?: string;
  tipoContrato: ContractType;
  status: PacientStatus;
  dataRegistro: string;
  dataUltimaVisita?: string;
  dataProximaVisita?: string;
  aparelhoId?: number;
  aparelhoNumeroPatrimonio?: string;
  profissionalResponsavelId?: number;
  profissionalResponsavelNome?: string;
  observacoes?: string;
}

export interface PacientRequest {
  nome: string;
  cpf: string;
  dataNascimento?: string;
  telefone?: string;
  telefoneSecundario?: string;
  email?: string;
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoComplemento?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  enderecoCep?: string;
  tipoContrato: ContractType;
  status: PacientStatus;
  dataProximaVisita?: string;
  aparelhoId?: number;
  profissionalResponsavelId?: number;
  observacoes?: string;
}