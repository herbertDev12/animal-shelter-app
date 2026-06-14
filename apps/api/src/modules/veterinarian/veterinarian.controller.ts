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
import { VeterinarianService } from './veterinarian.service';
import {
  CreateVeterinarianDto,
  UpdateVeterinarianDto,
  SearchVeterinariansFiltersDto,
} from '@repo/schemas';

@Controller('veterinarians')
export class VeterinarianController {
  constructor(private veterinarianService: VeterinarianService) {}

  @Get()
  async findAll() {
    return this.veterinarianService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchVeterinariansFiltersDto) {
    return this.veterinarianService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.veterinarianService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateVeterinarianDto) {
    return this.veterinarianService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateVeterinarianDto,
  ) {
    return this.veterinarianService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.veterinarianService.delete(id);
  }
}
