import { apiClient } from './client';
import type { AuthResponse, ApiResponse } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

  me: () => apiClient.get<ApiResponse<AuthResponse['user']>>('/auth/me'),

  logout: () => apiClient.post('/auth/logout'),

  /** Step 1 — request a 6-digit OTP sent to the email address */
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),

  /** Step 2 — verify that the OTP is correct and not expired */
  verifyOtp: (email: string, otp: string) =>
    apiClient.post<ApiResponse<{ valid: boolean }>>('/auth/verify-otp', { email, otp }),

  /** Step 3 — set a new password (OTP re-verified server-side) */
  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', { email, otp, newPassword }),
};
