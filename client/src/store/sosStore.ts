import { create } from 'zustand';
import type { EmergencyRequest, LocationUpdateEvent, StatusUpdateEvent } from '../types';
import { sosApi } from '../api/sos.api';

interface SosState {
  activeRequest: EmergencyRequest | null;
  requests: EmergencyRequest[];
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
  ambulanceLat: number | null;
  ambulanceLng: number | null;

  createSos: (data: {
    pickupLat: number; pickupLng: number; pickupAddress?: string;
    patientName?: string; patientAge?: number; medicalNotes?: string;
  }) => Promise<EmergencyRequest>;
  fetchActive: (id: string) => Promise<void>;
  fetchList: () => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  updateFromSocket: (event: StatusUpdateEvent) => void;
  updateAmbulanceLocation: (event: LocationUpdateEvent) => void;
  clearActive: () => void;
  clearError: () => void;
}

export const useSosStore = create<SosState>((set, get) => ({
  activeRequest: null,
  requests: [],
  isCreating: false,
  isLoading: false,
  error: null,
  ambulanceLat: null,
  ambulanceLng: null,

  createSos: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const res = await sosApi.create(data);
      const request = res.data.data;
      set({ activeRequest: request, isCreating: false });
      return request;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create SOS', isCreating: false });
      throw err;
    }
  },

  fetchActive: async (id) => {
    set({ isLoading: true });
    try {
      const res = await sosApi.getById(id);
      set({ activeRequest: res.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load request', isLoading: false });
    }
  },

  fetchList: async () => {
    set({ isLoading: true });
    try {
      const res = await sosApi.list();
      set({ requests: res.data.data.requests, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  cancelRequest: async (id) => {
    try {
      await sosApi.cancel(id);
      set({ activeRequest: null });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to cancel' });
      throw err;
    }
  },

  updateFromSocket: (event) => {
    set((state) => ({
      activeRequest: state.activeRequest?.id === event.requestId
        ? { ...state.activeRequest, status: event.status }
        : state.activeRequest,
    }));
  },

  updateAmbulanceLocation: (event) => {
    set({ ambulanceLat: event.lat, ambulanceLng: event.lng });
  },

  clearActive: () => set({ activeRequest: null, ambulanceLat: null, ambulanceLng: null }),
  clearError: () => set({ error: null }),
}));
