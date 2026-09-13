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
import { AdoptionService } from './adoption.service';
import { CreateAdoptionDto, SearchAdoptionsFiltersDto } from '@repo/schemas';

@Controller('adoptions')
export class AdoptionController {
  constructor(private adoptionService: AdoptionService) {}

  @RequirePermission('adoption.read')
  @Get()
  async findAll() {
    return this.adoptionService.findAll();
  }

  @RequirePermission('adoption.read')
  @Get('search')
  async search(@Query() filters: SearchAdoptionsFiltersDto) {
    return this.adoptionService.search(filters);
  }

  @RequirePermission('adoption.read')
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.adoptionService.findById(id);
  }

  @RequirePermission('adoption.create')
  @Post()
  async create(@Body() data: CreateAdoptionDto) {
    return this.adoptionService.create(data);
  }

  @RequirePermission('adoption.edit')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateAdoptionDto>,
  ) {
    return this.adoptionService.update(id, data);
  }

  @RequirePermission('adoption.edit')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.adoptionService.delete(id);
  }
}
