import api from './api';
import type { Pacient, PacientRequest } from '../types/pacient.types';

export type PacientListFilters = {
  tipoContrato?: string;
  bairro?: string;
};

export const pacientService = {
  async getAll(filters?: PacientListFilters): Promise<Pacient[]> {
    const params = new URLSearchParams();
    if (filters?.tipoContrato) {
      params.set('tipoContrato', filters.tipoContrato);
    }
    if (filters?.bairro) {
      params.set('bairro', filters.bairro);
    }
    const qs = params.toString();
    const response = await api.get(qs ? `/patients?${qs}` : '/patients');
    return response.data;
  },

  async getById(id: number): Promise<Pacient> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async create(data: PacientRequest): Promise<Pacient> {
    const response = await api.post('/patients', data);
    return response.data;
  },

  async update(id: number, data: Partial<PacientRequest>): Promise<Pacient> {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async updateLastVisit(id: number, dataVisita: string): Promise<Pacient> {
    const response = await api.patch(`/patients/${id}/last-visit`, { dataVisita });
    return response.data;
  },

  async getNeighborhoods(): Promise<string[]> {
    const response = await api.get('/patients/bairros');
    return response.data;
  }
};
