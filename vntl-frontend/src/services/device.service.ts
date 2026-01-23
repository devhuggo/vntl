import api from './api';
import type { Aparelho, AparelhoRequest } from '../types/devices.types';

export const deviceService = {
  async getAll(): Promise<Aparelho[]> {
    const response = await api.get('/devices');
    return response.data;
  },

  async getById(id: number): Promise<Aparelho> {
    const response = await api.get(`/devices/${id}`);
    return response.data;
  },

  async create(data: AparelhoRequest): Promise<Aparelho> {
    const response = await api.post('/devices', data);
    return response.data;
  },

  async update(id: number, data: Partial<AparelhoRequest>): Promise<Aparelho> {
    const response = await api.put(`/devices/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/devices/${id}`);
  },

  async getByStatus(status: string): Promise<Aparelho[]> {
    const response = await api.get(`/devices?status=${status}`);
    return response.data;
  }
};
