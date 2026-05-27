import { apiClient } from './client';
import { ApiResponse } from '../types';

export const providerApi = {
  // Admin endpoints
  list: async (): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get('/providers');
    return data;
  },

  create: async (body: {
    name: string;
    type: 'hospital' | 'private' | 'ngo' | 'government';
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  }): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/providers', body);
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get(`/providers/${id}`);
    return data;
  },

  createManager: async (
    id: string,
    body: { name: string; email: string; password: string; phone?: string }
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(`/providers/${id}/managers`, body);
    return data;
  },

  // Provider Manager endpoints
  getMyFleet: async (): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get('/providers/me/fleet');
    return data;
  },

  getMyDrivers: async (): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get('/providers/me/drivers');
    return data;
  },

  createDriver: async (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/providers/me/drivers', body);
    return data;
  },
};
