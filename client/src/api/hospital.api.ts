import { apiClient } from './client';
import type { ApiResponse, Hospital } from '../types';

export const hospitalApi = {
  list: () => apiClient.get<ApiResponse<Hospital[]>>('/hospitals'),
  getById: (id: string) => apiClient.get<ApiResponse<Hospital>>(`/hospitals/${id}`),
  incoming: (id: string) => apiClient.get(`/hospitals/${id}/incoming`),
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
