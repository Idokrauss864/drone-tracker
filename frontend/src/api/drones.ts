import { api } from './client';
import type { Drone } from '../types/drone';

export async function getAllDrones(): Promise<Drone[]> {
  const { data } = await api.get<Drone[]>('/drones');
  return data;
}

export async function resetDrones(): Promise<void> {
  await api.delete('/drones/reset');
}
