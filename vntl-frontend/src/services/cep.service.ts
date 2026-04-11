import api from './api';

export interface CepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export const cepService = {
  async getAddressByCep(cep: string): Promise<CepAddress> {
    const response = await api.get(`/ceps/${cep}`);
    return response.data;
  }
};

