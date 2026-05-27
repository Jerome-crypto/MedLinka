import { apiClient } from './client';
import type { ApiResponse, Ambulance } from '../types';

export const ambulanceApi = {
  list: (page = 1) =>
    apiClient.get<ApiResponse<{ ambulances: Ambulance[]; total: number }>>(`/ambulances?page=${page}`),

  getById: (id: string) => apiClient.get<ApiResponse<Ambulance>>(`/ambulances/${id}`),

  updateLocation: (id: string, lat: number, lng: number, requestId?: string) =>
    apiClient.patch(`/ambulances/${id}/location`, { lat, lng, requestId }),

  /** Admin: update any ambulance's status by ID */
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/ambulances/${id}/status`, { status }),

  /** Driver: update own ambulance status without knowing the ID */
  updateMyStatus: (status: string) =>
    apiClient.patch<ApiResponse<Ambulance>>('/ambulances/my-status', { status }),

  /** Admin/Provider Manager: Create ambulance */
  create: (body: any) => apiClient.post<ApiResponse<Ambulance>>('/ambulances', body),

  /** Admin/Provider Manager: Assign driver to ambulance */
  assignDriver: (id: string, driverId: string | null) =>
    apiClient.patch(`/ambulances/${id}/driver`, { driverId }),

  /** Admin/Provider Manager: Remove ambulance */
  remove: (id: string) => apiClient.delete(`/ambulances/${id}`),
};
