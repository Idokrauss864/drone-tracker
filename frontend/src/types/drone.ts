export type DroneType = 'surveillance' | 'delivery' | 'rescue';

export interface Drone {
  id: number;
  latitude: number;
  longitude: number;
  type: DroneType;
  createdAt: string; // ISO
}
