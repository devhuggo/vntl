import api from './api';
import type { Professional, ProfessionalRequest } from '../types/professional.types';

export const professionalService = {
  async getAll(): Promise<Professional[]> {
    const response = await api.get('/professionals');
    return response.data;
  },

  async getById(id: number): Promise<Professional> {
    const response = await api.get(`/professionals/${id}`);
    return response.data;
  },

  async create(data: ProfessionalRequest): Promise<Professional> {
    const response = await api.post('/professionals', data);
    return response.data;
  },

  async update(id: number, data: Partial<ProfessionalRequest>): Promise<Professional> {
    const response = await api.put(`/professionals/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/professionals/${id}`);
  },

  async getPatients(id: number): Promise<number[]> {
    const response = await api.get(`/professionals/${id}/patients`);
    return response.data;
  },

  async assignPatient(professionalId: number, patientId: number): Promise<void> {
    await api.post(`/professionals/${professionalId}/patients`, { patientId });
  },

  async unassignPatient(professionalId: number, patientId: number): Promise<void> {
    await api.delete(`/professionals/${professionalId}/patients/${patientId}`);
  }
};
