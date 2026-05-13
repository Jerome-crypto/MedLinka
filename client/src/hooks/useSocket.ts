import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return () => {
      // Don't disconnect on unmount — keep singleton alive
    };
  }, [accessToken]);

  const emit = (event: string, data?: unknown) => {
    socketInstance?.emit(event, data);
  };

  const on = (event: string, handler: (...args: any[]) => void) => {
    socketInstance?.on(event, handler);
    return () => { socketInstance?.off(event, handler); };
  };

  const off = (event: string, handler?: (...args: any[]) => void) => {
    socketInstance?.off(event, handler);
  };

  return { socket: socketRef.current, emit, on, off };
};
