import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Entregas de Muestras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles('ADMIN', 'ALMACENERO')
  @ApiOperation({ summary: 'Registrar una entrega de muestra médica a un visitador (Admin o Almacenero)' })
  @ApiResponse({ status: 201, description: 'Entrega registrada exitosamente y stock actualizado de forma atómica.' })
  @ApiResponse({ status: 400, description: 'Cantidad solicitada supera las existencias disponibles.' })
  @ApiResponse({ status: 404, description: 'Muestra médica o visitador no encontrado.' })
  async create(@Body() createDeliveryDto: CreateDeliveryDto, @Req() req: any) {
    const usuarioId = req.user?.id;
    return this.deliveriesService.create(createDeliveryDto, usuarioId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las entregas registradas' })
  async findAll() {
    return this.deliveriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una entrega en particular' })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una entrega y revertir el stock de la muestra médica (Solo Admin)' })
  @ApiResponse({ status: 403, description: 'Prohibido - Se requiere rol ADMIN.' })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada.' })
  async remove(@Param('id') id: string) {
    return this.deliveriesService.remove(id);
  }
}
