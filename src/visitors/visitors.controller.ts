import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Visitadores Médicos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  @Roles('ADMIN', 'ALMACENERO')
  @ApiOperation({ summary: 'Registrar un nuevo visitador médico (Admin o Almacenero)' })
  @ApiResponse({ status: 201, description: 'Visitador médico registrado exitosamente.' })
  async create(@Body() createVisitorDto: CreateVisitorDto) {
    return this.visitorsService.create(createVisitorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los visitadores médicos' })
  async findAll() {
    return this.visitorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un visitador médico' })
  @ApiResponse({ status: 404, description: 'Visitador médico no encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'ALMACENERO')
  @ApiOperation({ summary: 'Actualizar un visitador médico (Admin o Almacenero)' })
  @ApiResponse({ status: 404, description: 'Visitador médico no encontrado.' })
  async update(@Param('id') id: string, @Body() updateVisitorDto: UpdateVisitorDto) {
    return this.visitorsService.update(id, updateVisitorDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un visitador médico (Solo Admin)' })
  @ApiResponse({ status: 403, description: 'Prohibido - Se requiere rol ADMIN.' })
  @ApiResponse({ status: 404, description: 'Visitador médico no encontrado.' })
  async remove(@Param('id') id: string) {
    return this.visitorsService.remove(id);
  }
}
