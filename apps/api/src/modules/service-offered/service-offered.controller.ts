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
import { ServiceOfferedService } from './service-offered.service';
import {
  CreateServiceOfferedDto,
  UpdateServiceOfferedDto,
  SearchServiceOfferedFiltersDto,
} from '@repo/schemas';

@Controller('services-offered')
export class ServiceOfferedController {
  constructor(private readonly serviceOfferedService: ServiceOfferedService) {}

  @Get()
  async findAll() {
    return this.serviceOfferedService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchServiceOfferedFiltersDto) {
    return this.serviceOfferedService.search(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOfferedService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateServiceOfferedDto) {
    return this.serviceOfferedService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateServiceOfferedDto,
  ) {
    return this.serviceOfferedService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOfferedService.remove(id);
  }
}
