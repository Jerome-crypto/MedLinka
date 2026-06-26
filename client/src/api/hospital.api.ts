import { apiClient } from './client';
import type { ApiResponse, Hospital } from '../types';

export const hospitalApi = {
  list: () => apiClient.get<ApiResponse<Hospital[]>>('/hospitals'),
  mine: () => apiClient.get<ApiResponse<Hospital>>('/hospitals/mine'),
  getById: (id: string) => apiClient.get<ApiResponse<Hospital>>(`/hospitals/${id}`),
  incoming: (id: string) => apiClient.get(`/hospitals/${id}/incoming`),
  createAdmin: (hospitalId: string, body: any) => apiClient.post<ApiResponse<any>>(`/hospitals/${hospitalId}/admins`, body),
  getMyDrivers: () => apiClient.get<ApiResponse<any[]>>('/hospitals/mine/drivers'),
  createDriver: (body: any) => apiClient.post<ApiResponse<any>>('/hospitals/mine/drivers', body),
  getMyAmbulances: () => apiClient.get<ApiResponse<any[]>>('/hospitals/mine/ambulances'),
  createAmbulance: (body: any) => apiClient.post<ApiResponse<any>>('/hospitals/mine/ambulances', body),
  assignDriver: (id: string, driverId: string | null) => apiClient.patch<ApiResponse<any>>(`/hospitals/mine/ambulances/${id}/driver`, { driverId }),
};

export const reportsApi = {
  stats:                 () => apiClient.get('/reports/stats'),
  responseTime:          () => apiClient.get('/reports/response-time'),
  requestsPerDay:        () => apiClient.get('/reports/requests-per-day'),
  requestsPerWeek:       () => apiClient.get('/reports/requests-per-week'),
  analytics:             () => apiClient.get('/reports/analytics'),
  activityFeed:          (limit = 20) => apiClient.get(`/reports/activity-feed?limit=${limit}`),
  ambulanceUtilisation:  () => apiClient.get('/reports/ambulance-utilisation'),
  recentRequests:        (limit = 100) => apiClient.get(`/reports/recent-requests?limit=${limit}`),
  exportCSV:             () => apiClient.get('/reports/export', { responseType: 'blob' }),
};
