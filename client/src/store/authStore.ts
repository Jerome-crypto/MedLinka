import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '../types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (phone: string, password: string) => Promise<void>;
  register: (data: { name: string; phone: string; password: string; email?: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (data: AuthResponse) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      setAuth: (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, error: null });
      },

      login: async (phone, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login({ phone, password });
          get().setAuth(res.data.data);
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Login failed' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(data);
          get().setAuth(res.data.data);
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Registration failed' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'medlinka-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }),
    }
  )
);
