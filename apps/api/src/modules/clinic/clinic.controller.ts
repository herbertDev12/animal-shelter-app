import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequirePermission } from '../auth/permissions.decorator';
import { ClinicService } from './clinic.service';
import { CreateClinicDto, SearchClinicsFiltersDto } from '@repo/schemas';

@Controller('clinics')
export class ClinicController {
  constructor(private clinicsService: ClinicService) {}

  @RequirePermission('clinic.read')
  @Get()
  async findAll() {
    return this.clinicsService.findAll();
  }

  @RequirePermission('clinic.read')
  @Get('search')
  async search(@Query() filters: SearchClinicsFiltersDto) {
    return this.clinicsService.search(filters);
  }

  @RequirePermission('clinic.read')
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.clinicsService.findById(id);
  }

  @RequirePermission('clinic.create')
  @Post()
  async create(@Body() data: CreateClinicDto) {
    return this.clinicsService.create(data);
  }

  @RequirePermission('clinic.edit')
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<CreateClinicDto>,
  ) {
    return this.clinicsService.update(id, data);
  }

  @RequirePermission('clinic.edit')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.clinicsService.delete(id);
  }
}
