import api from './api';
import type { Pacient, PacientRequest } from '../types/pacient.types';

export const pacientService = {
  async getAll(): Promise<Pacient[]> {
    const response = await api.get('/patients');
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

  async getByStatus(status: string): Promise<Pacient[]> {
    const response = await api.get(`/patients?status=${status}`);
    return response.data;
  },

  async updateLastVisit(id: number, dataVisita: string): Promise<Pacient> {
    const response = await api.patch(`/patients/${id}/last-visit`, { dataVisita });
    return response.data;
  }
};
