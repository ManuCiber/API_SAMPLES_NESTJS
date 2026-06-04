import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const logs = await this.prisma.logInventario.findMany({
      include: {
        muestra: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return {
      success: true,
      data: logs,
    };
  }

  async findBySample(muestraId: string) {
    const sample = await this.prisma.muestra.findUnique({ where: { id: muestraId } });
    if (!sample) {
      throw new NotFoundException(`Muestra médica con ID ${muestraId} no encontrada`);
    }

    const logs = await this.prisma.logInventario.findMany({
      where: { muestra_id: muestraId },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      muestra: sample.nombre,
      data: logs,
    };
  }
}
