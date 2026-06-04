import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateSampleDto {
  @ApiProperty({ example: 'Ibuprofeno 400mg', description: 'Nombre de la muestra médica' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({ example: 150, description: 'Cantidad inicial en inventario' })
  @IsInt({ message: 'Las existencias deben ser un número entero' })
  @Min(0, { message: 'Las existencias no pueden ser negativas' })
  existencias: number;

  @ApiProperty({ example: 20, description: 'Umbral mínimo antes de activar alerta' })
  @IsInt({ message: 'El umbral mínimo debe ser un número entero' })
  @Min(0, { message: 'El umbral mínimo no puede ser negativo' })
  umbral_minimo: number;
}
