export type Position = [number, number];
export interface Polygon { type: 'Polygon'; coordinates: Position[][] }
export interface MultiPolygon { type: 'MultiPolygon'; coordinates: Position[][][] }
export type PolygonLike = Polygon | MultiPolygon;

function pointInRing(lat: number, lng: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isPointInPolygon(lat: number, lng: number, polygon: PolygonLike): boolean {
  if (polygon.type === 'Polygon') {
    const [outer, ...holes] = polygon.coordinates;
    if (!pointInRing(lat, lng, outer)) return false;
    for (const hole of holes) {
      if (pointInRing(lat, lng, hole)) return false;
    }
    return true;
  }
  for (const poly of polygon.coordinates) {
    const [outer, ...holes] = poly;
    if (pointInRing(lat, lng, outer)) {
      for (const hole of holes) {
        if (pointInRing(lat, lng, hole)) return false;
      }
      return true;
    }
  }
  return false;
}


