import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, nombre, role } = signupDto;

    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        email,
        nombre,
        password: hashedPassword,
        role: role || 'ALMACENERO',
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      accessToken: token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      accessToken: token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    };
  }
}
