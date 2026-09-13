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
import { RequirePermission } from '../auth/permissions.decorator';
import { AnimalService } from './animal.service';
import { CreateAnimalDto, SearchAnimalsFiltersDto } from '@repo/schemas';

@Controller('animals')
export class AnimalController {
  constructor(private animalsService: AnimalService) {}

  @RequirePermission('animal.read')
  @Get()
  async findAll() {
    return this.animalsService.findAll();
  }

  @RequirePermission('animal.read')
  @Get('search')
  async search(@Query() filters: SearchAnimalsFiltersDto) {
    return this.animalsService.search(filters);
  }

  @RequirePermission('animal.read')
  @Get('stats')
  async getStats() {
    return this.animalsService.getStats();
  }

  @RequirePermission('animal.read')
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.animalsService.findById(id);
  }

  @RequirePermission('animal.create')
  @Post()
  async create(@Body() data: CreateAnimalDto) {
    return this.animalsService.create(data);
  }

  @RequirePermission('animal.edit')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateAnimalDto>,
  ) {
    return this.animalsService.update(id, data);
  }

  @RequirePermission('animal.edit')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.animalsService.delete(id);
  }
}
