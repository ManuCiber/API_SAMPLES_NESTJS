import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVisitorDto: CreateVisitorDto) {
    const visitor = await this.prisma.visitador.create({
      data: createVisitorDto,
    });
    return {
      success: true,
      data: visitor,
    };
  }

  async findAll() {
    const visitors = await this.prisma.visitador.findMany({
      orderBy: { created_at: 'desc' },
    });
    return {
      success: true,
      data: visitors,
    };
  }

  async findOne(id: string) {
    const visitor = await this.prisma.visitador.findUnique({
      where: { id },
      include: {
        entregas: true,
      },
    });
    if (!visitor) {
      throw new NotFoundException(`Visitador con ID ${id} no encontrado`);
    }
    return {
      success: true,
      data: visitor,
    };
  }

  async update(id: string, updateVisitorDto: UpdateVisitorDto) {
    const existing = await this.prisma.visitador.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Visitador con ID ${id} no encontrado`);
    }

    const updatedVisitor = await this.prisma.visitador.update({
      where: { id },
      data: updateVisitorDto,
    });

    return {
      success: true,
      message: 'Visitador médico actualizado correctamente',
      data: updatedVisitor,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.visitador.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Visitador con ID ${id} no encontrado`);
    }

    await this.prisma.visitador.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Visitador ${existing.nombre} eliminado correctamente`,
    };
  }
}
