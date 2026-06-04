import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Muestras Médicas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('samples')
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Post()
  @Roles('ADMIN', 'ALMACENERO')
  @ApiOperation({ summary: 'Crear una nueva muestra médica (Admin o Almacenero)' })
  @ApiResponse({ status: 201, description: 'Muestra médica creada exitosamente.' })
  async create(@Body() createSampleDto: CreateSampleDto) {
    return this.samplesService.create(createSampleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las muestras médicas' })
  async findAll() {
    return this.samplesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una muestra médica' })
  @ApiResponse({ status: 404, description: 'Muestra médica no encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.samplesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'ALMACENERO')
  @ApiOperation({ summary: 'Actualizar una muestra médica (Admin o Almacenero)' })
  @ApiResponse({ status: 404, description: 'Muestra médica no encontrada.' })
  async update(@Param('id') id: string, @Body() updateSampleDto: UpdateSampleDto) {
    return this.samplesService.update(id, updateSampleDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una muestra médica (Solo Admin)' })
  @ApiResponse({ status: 403, description: 'Prohibido - Se requiere rol ADMIN.' })
  @ApiResponse({ status: 404, description: 'Muestra médica no encontrada.' })
  async remove(@Param('id') id: string) {
    return this.samplesService.remove(id);
  }
}
