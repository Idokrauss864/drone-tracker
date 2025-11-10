import { IsNumber, IsString, IsIn, Min, Max } from 'class-validator';

export class CreateDroneDto {
  @IsNumber()
  @Min(29.5)
  @Max(33.3)
  latitude: number;

  @IsNumber()
  @Min(34.2)
  @Max(35.9)
  longitude: number;

  @IsString()
  @IsIn(['surveillance', 'delivery', 'rescue'])
  type: string;
}
