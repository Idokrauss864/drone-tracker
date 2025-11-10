export type Drone = {
    id: number;
    latitude: number;   // WGS84
    longitude: number;  // WGS84
    type: 'surveillance' | 'delivery' | 'rescue';
    createdAt: string;
  };
  