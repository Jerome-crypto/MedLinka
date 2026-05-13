import { apiClient } from './client';
import type { ApiResponse, EmergencyRequest } from '../types';

export const sosApi = {
  create: (data: {
    pickupLat: number;
    pickupLng: number;
    pickupAddress?: string;
    patientName?: string;
    patientAge?: number;
    medicalNotes?: string;
  }) => apiClient.post<ApiResponse<EmergencyRequest>>('/sos', data),

  list: (page = 1, limit = 20) =>
    apiClient.get<ApiResponse<{ requests: EmergencyRequest[]; total: number; totalPages: number }>>(
      `/sos?page=${page}&limit=${limit}`
    ),

  getById: (id: string) => apiClient.get<ApiResponse<EmergencyRequest>>(`/sos/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<ApiResponse<EmergencyRequest>>(`/sos/${id}/status`, { status }),

  cancel: (id: string) => apiClient.patch<ApiResponse<EmergencyRequest>>(`/sos/${id}/cancel`),

  acknowledge: (id: string) =>
    apiClient.post<ApiResponse<{ id: string; status: string; acknowledgedAt: string }>>(`/sos/${id}/acknowledge`),
};
