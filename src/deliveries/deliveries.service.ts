import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  async create(createDeliveryDto: CreateDeliveryDto, usuarioId?: string) {
    const { muestra_id, visitador_id, cantidad, fecha, hora, estado } = createDeliveryDto;

    const visitor = await this.prisma.visitador.findUnique({
      where: { id: visitador_id },
    });
    if (!visitor) {
      throw new NotFoundException(`Visitador con ID ${visitador_id} no encontrado`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const sample = await tx.muestra.findUnique({
        where: { id: muestra_id },
      });
      if (!sample) {
        throw new NotFoundException(`Muestra médica con ID ${muestra_id} no encontrada`);
      }

      if (sample.existencias < cantidad) {
        throw new BadRequestException(
          `Existencias insuficientes para la muestra "${sample.nombre}". Disponibles: ${sample.existencias}, solicitadas: ${cantidad}`,
        );
      }

      const finalFecha = fecha ? new Date(`${fecha}T00:00:00Z`) : new Date();
      const finalHora = hora ? new Date(`1970-01-01T${hora}:00Z`) : new Date();

      const delivery = await tx.entrega.create({
        data: {
          muestra_id,
          visitador_id,
          cantidad,
          fecha: finalFecha,
          hora: finalHora,
          estado: estado || 'Entregado',
          nombre_muestra: sample.nombre,
          nombre_visitador: visitor.nombre,
        },
      });

      const updatedSample = await tx.muestra.update({
        where: { id: muestra_id },
        data: {
          existencias: {
            decrement: cantidad,
          },
        },
      });

      await tx.visitador.update({
        where: { id: visitador_id },
        data: {
          muestras_asignadas: {
            increment: cantidad,
          },
        },
      });

      await tx.logInventario.create({
        data: {
          muestra_id,
          tipo_movimiento: 'SALIDA_ENTREGA',
          cantidad,
          descripcion: `Entrega de ${cantidad} unidades al visitador ${visitor.nombre}`,
          usuario_id: usuarioId || null,
        },
      });

      const isUnderThreshold = updatedSample.existencias <= updatedSample.umbral_minimo;

      return {
        success: true,
        message: 'Entrega registrada de forma exitosa',
        data: delivery,
        alert: isUnderThreshold
          ? `Alerta: El stock de la muestra médica "${sample.nombre}" ha caído por debajo del umbral mínimo. Stock actual: ${updatedSample.existencias}, Umbral: ${updatedSample.umbral_minimo}`
          : null,
      };
    });
  }

  async findAll() {
    const deliveries = await this.prisma.entrega.findMany({
      include: {
        muestra: true,
        visitador: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return {
      success: true,
      data: deliveries,
    };
  }

  async findOne(id: string) {
    const delivery = await this.prisma.entrega.findUnique({
      where: { id },
      include: {
        muestra: true,
        visitador: true,
      },
    });
    if (!delivery) {
      throw new NotFoundException(`Entrega con ID ${id} no encontrada`);
    }
    return {
      success: true,
      data: delivery,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.entrega.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Entrega con ID ${id} no encontrada`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.entrega.delete({
        where: { id },
      });

      await tx.muestra.update({
        where: { id: existing.muestra_id },
        data: {
          existencias: {
            increment: existing.cantidad,
          },
        },
      });

      await tx.visitador.update({
        where: { id: existing.visitador_id },
        data: {
          muestras_asignadas: {
            decrement: existing.cantidad,
          },
        },
      });

      await tx.logInventario.create({
        data: {
          muestra_id: existing.muestra_id,
          tipo_movimiento: 'REVERSION_ENTREGA',
          cantidad: existing.cantidad,
          descripcion: `Eliminación y reversión de la entrega ${id}. Se devuelven ${existing.cantidad} unidades al stock.`,
        },
      });
    });

    return {
      success: true,
      message: 'Entrega eliminada y stock revertido exitosamente',
    };
  }
}
