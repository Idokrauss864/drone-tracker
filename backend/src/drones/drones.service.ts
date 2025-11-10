import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drone } from './drone.entity';
import { Interval } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { DronesGateway } from './drones.gateway';
import * as fs from 'fs';
import * as path from 'path';
import { isPointInPolygon, Polygon, MultiPolygon } from '../geo/geo.util';

@Injectable()
export class DronesService implements OnModuleInit {
  private readonly logger = new Logger(DronesService.name);
  private israelPolygon: Polygon | MultiPolygon | null = null;
  private readonly bbox = {
    minLat: 29.5,
    maxLat: 33.3,
    minLng: 34.2,
    maxLng: 35.9,
  };
  private precomputedValidPoints: Array<{ lat: number; lng: number }> = [];
  constructor(
    @InjectRepository(Drone) private readonly repo: Repository<Drone>,
    private readonly gateway: DronesGateway,
  ) {}


  async onModuleInit(): Promise<void> {
    try {
      const distPath = path.join(__dirname, '..', 'geo', 'israel.geo.json');
      const srcPath = path.join(process.cwd(), 'src', 'geo', 'israel.geo.json');
      const file = fs.existsSync(distPath) ? distPath : srcPath;
      const raw = fs.readFileSync(file, 'utf8');
      const feature = JSON.parse(raw) as { type: 'Feature'; geometry: Polygon | MultiPolygon };
      const geom = feature.geometry;
      this.israelPolygon = geom;
      const rings = geom.type === 'Polygon' ? geom.coordinates.length : geom.coordinates.reduce((sum, poly) => sum + poly.length, 0);
      const coords = geom.type === 'Polygon' ? geom.coordinates.reduce((sum, r) => sum + r.length, 0) : geom.coordinates.reduce((sum, poly) => sum + poly.reduce((s, r) => s + r.length, 0), 0);
      this.logger.log(`Loaded Israel polygon (${rings} rings, ${coords} coords).`);
      this.fillPrecomputedPool(200);
      if (this.precomputedValidPoints.length === 0) {
        this.logger.warn('No valid precomputed points; check bbox vs polygon overlap. Falling back to on-demand sampling.');
      }
    } catch (e) {
      this.logger.error('Failed to load Israel polygon', e as Error);
      this.israelPolygon = null;
    }
  }

  @Interval(10000)
  async generateDrone(): Promise<void> {
    const { lat, lng } = this.getValidPoint();

const types = ['surveillance', 'delivery', 'rescue'];
const randomType = types[Math.floor(Math.random() * types.length)];


const saved = await this.repo.save(this.repo.create({
    latitude: lat,
    longitude: lng,
    type: randomType,
  }));
  this.logger.log(`🛸 New drone @ lat=${saved.latitude.toFixed(4)}, lng=${saved.longitude.toFixed(4)} type=${saved.type}`);
  
  this.gateway.broadcastNewDrone({
    id: saved.id,
    latitude: saved.latitude,
    longitude: saved.longitude,
    type: saved.type,
    createdAt: saved.createdAt,
  });

  }

  async create(drone: Partial<Drone>): Promise<Drone> {
    const chosen = this.chooseValidCoordinates(drone);
    const saved = await this.repo.save(this.repo.create({ ...drone, ...chosen }));
    this.gateway.broadcastNewDrone({
      id: saved.id,
      latitude: saved.latitude,
      longitude: saved.longitude,
      type: saved.type,
      createdAt: saved.createdAt,
    });
    return saved;
  }

  async findAll(): Promise<Drone[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async deleteAll(): Promise<void> {
    await this.repo.clear();
  }
  async findOneById(id: number): Promise<Drone | null> {
    return this.repo.findOne({ where: { id: id } });
  }

  private chooseValidCoordinates(drone: Partial<Drone>): { latitude: number; longitude: number } {
    if (this.israelPolygon && typeof drone.latitude === 'number' && typeof drone.longitude === 'number') {
      if (isPointInPolygon(drone.latitude, drone.longitude, this.israelPolygon)) {
        return { latitude: drone.latitude, longitude: drone.longitude };
      }
      this.logger.warn('Provided coordinates outside polygon. Generating a valid fallback.');
    }
    const { lat, lng } = this.getValidPoint();
    return { latitude: lat, longitude: lng };
  }

  private getValidPoint(): { lat: number; lng: number } {
    if (this.precomputedValidPoints.length > 0) {
      const pick = this.precomputedValidPoints[Math.floor(Math.random() * this.precomputedValidPoints.length)];
      return { lat: pick.lat, lng: pick.lng };
    }
    const { minLat, maxLat, minLng, maxLng } = this.bbox;
    const maxAttempts = 200;
    for (let i = 0; i < maxAttempts; i++) {
      const lat = minLat + Math.random() * (maxLat - minLat);
      const lng = minLng + Math.random() * (maxLng - minLng);
      if (!this.israelPolygon || isPointInPolygon(lat, lng, this.israelPolygon)) {
        return { lat, lng };
      }
    }
    this.logger.warn('Exceeded attempts for valid point, using fallback from pool (after generating).');
    this.fillPrecomputedPool(100);
    if (this.precomputedValidPoints.length > 0) {
      const pick = this.precomputedValidPoints[Math.floor(Math.random() * this.precomputedValidPoints.length)];
      return { lat: pick.lat, lng: pick.lng };
    }
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  }

  private fillPrecomputedPool(targetSize: number): void {
    if (!this.israelPolygon) return;
    const { minLat, maxLat, minLng, maxLng } = this.bbox;
    let attempts = 0;
    const maxAttempts = targetSize * 200;
    while (this.precomputedValidPoints.length < targetSize && attempts < maxAttempts) {
      attempts++;
      const lat = minLat + Math.random() * (maxLat - minLat);
      const lng = minLng + Math.random() * (maxLng - minLng);
      if (isPointInPolygon(lat, lng, this.israelPolygon)) {
        this.precomputedValidPoints.push({ lat, lng });
      }
    }
  }
}