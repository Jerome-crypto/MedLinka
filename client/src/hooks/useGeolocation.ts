import { useState, useEffect, useCallback } from 'react';

interface GeoState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (autoRequest = false) => {
  const [state, setState] = useState<GeoState>({
    lat: null, lng: null, accuracy: null, error: null, loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser' }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    if (autoRequest) getLocation();
  }, [autoRequest, getLocation]);

  return { ...state, getLocation };
};
