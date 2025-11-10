import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DronesService } from './drones.service';
import { DronesController } from './drones.controller';
import { Drone } from './drone.entity';
import { DronesGateway } from './drones.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Drone])],
  controllers: [DronesController],
  providers: [DronesService, DronesGateway],
  exports: [DronesService],
})
export class DronesModule {}
