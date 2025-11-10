import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('drones')
export class Drone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  @Column({ length: 50 })
  type: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
