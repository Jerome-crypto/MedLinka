import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '../types';
import { authApi } from '../api/auth.api';
import { socketInstance } from '../hooks/useSocket';

// Decode JWT payload (client-side only — no verification needed here)
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

// After login, make hospital_admin or provider_manager join their specific socket room
function joinSpecificRoomIfNeeded(accessToken: string) {
  const payload = decodeToken(accessToken);
  
  const tryJoin = () => {
    if (socketInstance?.connected) {
      if (payload?.hospitalId) socketInstance?.emit('hospital:join', payload.hospitalId as string);
      if (payload?.providerId) socketInstance?.emit('provider:join', payload.providerId as string);
    } else {
      socketInstance?.once('connect', () => {
        if (payload?.hospitalId) socketInstance?.emit('hospital:join', payload.hospitalId as string);
        if (payload?.providerId) socketInstance?.emit('provider:join', payload.providerId as string);
      });
    }
  };
  tryJoin();
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
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
        if (data.user.role === 'hospital_admin' || data.user.role === 'provider_manager') {
          joinSpecificRoomIfNeeded(data.accessToken);
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login({ email, password });
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
