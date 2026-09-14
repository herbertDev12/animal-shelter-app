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
import { VeterinarianService } from './veterinarian.service';
import {
  CreateVeterinarianDto,
  UpdateVeterinarianDto,
  SearchVeterinariansFiltersDto,
} from '@repo/schemas';

@Controller('veterinarians')
export class VeterinarianController {
  constructor(private veterinarianService: VeterinarianService) {}

  @RequirePermission('veterinarian.read')
  @Get()
  async findAll() {
    return this.veterinarianService.findAll();
  }

  @RequirePermission('veterinarian.read')
  @Get('search')
  async search(@Query() filters: SearchVeterinariansFiltersDto) {
    return this.veterinarianService.search(filters);
  }

  @RequirePermission('veterinarian.read')
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.veterinarianService.findById(id);
  }

  @RequirePermission('veterinarian.create')
  @Post()
  async create(@Body() data: CreateVeterinarianDto) {
    return this.veterinarianService.create(data);
  }

  @RequirePermission('veterinarian.edit')
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateVeterinarianDto,
  ) {
    return this.veterinarianService.update(id, data);
  }

  @RequirePermission('veterinarian.edit')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.veterinarianService.delete(id);
  }
}
