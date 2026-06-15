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
import { AdoptionService } from './adoption.service';
import { CreateAdoptionDto, SearchAdoptionsFiltersDto } from '@repo/schemas';

@Controller('adoptions')
export class AdoptionController {
  constructor(private adoptionService: AdoptionService) {}

  @Get()
  async findAll() {
    return this.adoptionService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchAdoptionsFiltersDto) {
    return this.adoptionService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.adoptionService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateAdoptionDto) {
    return this.adoptionService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateAdoptionDto>,
  ) {
    return this.adoptionService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.adoptionService.delete(id);
  }
}
