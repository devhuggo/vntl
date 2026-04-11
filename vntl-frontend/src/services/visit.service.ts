import api from './api';
import type { Visit, VisitRequest } from '../types/visit.types';

export type VisitListParams = {
  status?: string;
  dataVisitaDe?: string;
  dataVisitaAte?: string;
};

export const visitService = {
  async getAll(params?: VisitListParams): Promise<Visit[]> {
    const response = await api.get('/visits', { params });
    return response.data;
  },

  async getById(id: number): Promise<Visit> {
    const response = await api.get(`/visits/${id}`);
    return response.data;
  },

  async create(data: VisitRequest): Promise<Visit> {
    const response = await api.post('/visits', data);
    return response.data;
  },

  async update(id: number, data: VisitRequest): Promise<Visit> {
    const response = await api.put(`/visits/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/visits/${id}`);
  },

  async search(params: {
    pacienteId?: number;
    profissionalId?: number;
    aparelhoId?: number;
    status?: string;
    tipoVisita?: string;
    inicio?: string;
    fim?: string;
  }): Promise<Visit[]> {
    const response = await api.get('/visits', { params });
    return response.data;
  },

  async getByDateRange(inicio: string, fim: string): Promise<Visit[]> {
    const response = await api.get('/visits/by-range', { params: { inicio, fim } });
    return response.data;
  },

  async getUpcoming(params: { pacienteId?: number; profissionalId?: number } = {}): Promise<Visit[]> {
    const response = await api.get('/visits/upcoming', { params });
    return response.data;
  },

  async reschedule(id: number, data: { dataHoraAgendada: string; profissionalId?: number }): Promise<Visit> {
    const response = await api.post(`/visits/${id}/reschedule`, data);
    return response.data;
  },

  async cancel(id: number): Promise<Visit> {
    const response = await api.post(`/visits/${id}/cancel`);
    return response.data;
  },

  async finalize(id: number, data: { observacoes?: string; criarProximaVisita: boolean }): Promise<Visit> {
    const response = await api.post(`/visits/${id}/finalize`, data);
    return response.data;
  }
};

