import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { DronesService } from './drones.service';
import { CreateDroneDto } from './DTO/create-drone.dto';
import { Drone } from './drone.entity';

@Controller('drones')
export class DronesController {
  constructor(private readonly service: DronesService) {}

  @Get()
  getAll(): Promise<Drone[]> {
    return this.service.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Drone | null> {
    return this.service.findOneById(id);
  }

  @Post()
  create(@Body() dto: CreateDroneDto): Promise<Drone> {
    return this.service.create(dto);
  }

  @Delete('reset')
  async reset() {
    await this.service.deleteAll();
    return { message: 'All drones deleted ✅' };
  }
}
