import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { CreateClinicDto, SearchClinicsFiltersDto } from '@repo/schemas';

@Controller('clinics')
export class ClinicController {
  constructor(private clinicsService: ClinicService) {}

  @Get()
  async findAll() {
    return this.clinicsService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchClinicsFiltersDto) {
    return this.clinicsService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateClinicDto) {
    return this.clinicsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateClinicDto>,
  ) {
    return this.clinicsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.delete(id);
  }
}
