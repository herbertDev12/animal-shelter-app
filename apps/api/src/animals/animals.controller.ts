import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto, SearchAnimalsFilters } from '../database/repositories/animals.repository';

@Controller('animals')
export class AnimalsController {
  constructor(private animalsService: AnimalsService) {}

  @Get()
  async findAll() {
    return this.animalsService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchAnimalsFilters) {
    return this.animalsService.search(filters);
  }

  @Get('stats')
  async getStats() {
    return this.animalsService.getStats();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.animalsService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateAnimalDto) {
    return this.animalsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CreateAnimalDto>,
  ) {
    return this.animalsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.animalsService.delete(id);
  }
}
