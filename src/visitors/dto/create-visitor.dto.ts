import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateVisitorDto {
  @ApiProperty({ example: 'Dr. Carlos Mendoza', description: 'Nombre completo del visitador médico' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({ example: 'Zona Norte / Hospitales', description: 'Zona geográfica asignada' })
  @IsString()
  @IsNotEmpty({ message: 'La zona es requerida' })
  zona: string;

  @ApiProperty({ example: 0, description: 'Número inicial de muestras asignadas a este visitador' })
  @IsInt({ message: 'Las muestras asignadas deben ser un número entero' })
  @Min(0, { message: 'El número de muestras asignadas no puede ser negativo' })
  muestras_asignadas: number;
}
