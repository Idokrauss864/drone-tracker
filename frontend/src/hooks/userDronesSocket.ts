import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Drone } from '../types/drone';
import { api } from '../api/client';

type OnNewDrone = (drone: Drone) => void;

export function useDronesSocket(onNewDrone: OnNewDrone) {
  useEffect(() => {
    const envWs = import.meta.env.VITE_WS_URL as string | undefined;
    const restBase = (api.defaults.baseURL as string) || 'http://127.0.0.1:3000';
    const derived = (() => {
      try {
        const u = new URL(restBase);
        u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
        u.pathname = '/ws';
        if (u.hostname === 'localhost') u.hostname = '127.0.0.1';
        return u.toString();
      } catch {
        return 'ws://127.0.0.1:3000/ws';
      }
    })();
    const resolvedWs = envWs ? (envWs.includes('localhost') ? envWs.replace('localhost', '127.0.0.1') : envWs) : derived;
    // eslint-disable-next-line no-console
    console.log('WS URL:', resolvedWs);
    const socket: Socket = io(resolvedWs, { transports: ['websocket'] });

    socket.on('connect', () => console.log('[WS] connected', socket.id));
    socket.on('disconnect', () => console.log('[WS] disconnected'));

    socket.on('newDrone', (payload: Drone) => {
      // eslint-disable-next-line no-console
      console.log('[WS] New drone', payload.id);
      onNewDrone(payload);
    });

    return () => {
      socket.off('newDrone');
      socket.disconnect();
    };
  }, [onNewDrone]);
}
