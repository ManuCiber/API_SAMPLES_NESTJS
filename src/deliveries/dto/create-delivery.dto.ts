import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({ example: 'a0b1c2d3-e4f5-a6b7-c8d9-e0f1a2b3c4d5', description: 'UUID de la muestra médica' })
  @IsString()
  @IsNotEmpty({ message: 'El ID de la muestra es requerido' })
  muestra_id: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-f6e7-d8c9-b0a1f2e3d4c5', description: 'UUID del visitador médico' })
  @IsString()
  @IsNotEmpty({ message: 'El ID del visitador es requerido' })
  visitador_id: string;

  @ApiProperty({ example: 10, description: 'Cantidad de muestras médicas entregadas' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad a entregar debe ser al menos 1' })
  cantidad: number;

  @ApiProperty({ example: '2026-05-21', description: 'Fecha de la entrega (YYYY-MM-DD)', required: false })
  @IsDateString({}, { message: 'Fecha inválida. Debe ser YYYY-MM-DD' })
  @IsOptional()
  fecha?: string;

  @ApiProperty({ example: '14:30', description: 'Hora de la entrega (HH:MM)', required: false })
  @IsString()
  @IsOptional()
  hora?: string;

  @ApiProperty({ example: 'Entregado', description: 'Estado de la entrega (e.g. Entregado, Pendiente)', required: false })
  @IsString()
  @IsOptional()
  estado?: string;
}
