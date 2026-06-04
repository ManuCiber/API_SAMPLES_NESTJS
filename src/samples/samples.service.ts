import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';

@Injectable()
export class SamplesService {
  constructor(private prisma: PrismaService) {}

  async create(createSampleDto: CreateSampleDto) {
    const sample = await this.prisma.muestra.create({
      data: createSampleDto,
    });

    await this.prisma.logInventario.create({
      data: {
        muestra_id: sample.id,
        tipo_movimiento: 'ENTRADA_CREACION',
        cantidad: sample.existencias,
        descripcion: `Registro inicial de muestra médica: ${sample.nombre}`,
      },
    });

    return {
      success: true,
      data: sample,
    };
  }

  async findAll() {
    const samples = await this.prisma.muestra.findMany({
      orderBy: { created_at: 'desc' },
    });

    const formattedSamples = samples.map((sample) => ({
      ...sample,
      alert_low_stock: sample.existencias <= sample.umbral_minimo,
    }));

    return {
      success: true,
      data: formattedSamples,
    };
  }

  async findOne(id: string) {
    const sample = await this.prisma.muestra.findUnique({
      where: { id },
      include: {
        entregas: true,
        logs_inventario: true,
      },
    });
    if (!sample) {
      throw new NotFoundException(`Muestra médica con ID ${id} no encontrada`);
    }

    return {
      success: true,
      data: {
        ...sample,
        alert_low_stock: sample.existencias <= sample.umbral_minimo,
      },
    };
  }

  async update(id: string, updateSampleDto: UpdateSampleDto) {
    const existing = await this.prisma.muestra.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Muestra médica con ID ${id} no encontrada`);
    }

    const updatedSample = await this.prisma.muestra.update({
      where: { id },
      data: updateSampleDto,
    });

    if (updateSampleDto.existencias !== undefined && updateSampleDto.existencias !== existing.existencias) {
      const diff = updateSampleDto.existencias - existing.existencias;
      await this.prisma.logInventario.create({
        data: {
          muestra_id: id,
          tipo_movimiento: diff > 0 ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA',
          cantidad: Math.abs(diff),
          descripcion: `Ajuste manual de inventario. Anterior: ${existing.existencias}, Nuevo: ${updateSampleDto.existencias}`,
        },
      });
    }

    return {
      success: true,
      message: 'Muestra médica actualizada correctamente',
      data: updatedSample,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.muestra.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Muestra médica con ID ${id} no encontrada`);
    }

    await this.prisma.muestra.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Muestra médica ${existing.nombre} eliminada correctamente`,
    };
  }
}
