import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InventoryLogsService } from './inventory-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Auditoría e Historial de Inventario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory-logs')
export class InventoryLogsController {
  constructor(private readonly logsService: InventoryLogsService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener todo el historial de auditoría de inventario (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Historial retornado correctamente.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido - Requiere rol ADMIN.' })
  async findAll() {
    return this.logsService.findAll();
  }

  @Get('sample/:sampleId')
  @Roles('ADMIN', 'ALMACENERO')
  @ApiOperation({ summary: 'Obtener los movimientos de inventario de una muestra específica (Admin o Almacenero)' })
  @ApiResponse({ status: 200, description: 'Movimientos de la muestra médica retornados.' })
  @ApiResponse({ status: 404, description: 'Muestra médica no encontrada.' })
  async findBySample(@Param('sampleId') sampleId: string) {
    return this.logsService.findBySample(sampleId);
  }
}
