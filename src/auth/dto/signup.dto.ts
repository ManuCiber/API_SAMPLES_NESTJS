import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'admin@warehouse.com', description: 'Correo electrónico único para registro' })
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secret123', description: 'Contraseña segura (mínimo 6 caracteres)' })
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'ALMACENERO', description: 'Rol del usuario: ADMIN o ALMACENERO', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}
