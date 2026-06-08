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
import { AnimalService } from './animal.service';
import { CreateAnimalDto, SearchAnimalsFiltersDto } from '@repo/schemas';

@Controller('animals')
export class AnimalController {
  constructor(private animalsService: AnimalService) {}

  @Get()
  async findAll() {
    return this.animalsService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchAnimalsFiltersDto) {
    return this.animalsService.search(filters);
  }

  @Get('stats')
  async getStats() {
    return this.animalsService.getStats();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.animalsService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateAnimalDto) {
    return this.animalsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateAnimalDto>,
  ) {
    return this.animalsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.animalsService.delete(id);
  }
}
