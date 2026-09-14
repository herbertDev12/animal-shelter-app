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
import { ServiceOfferedService } from './service-offered.service';
import {
  CreateServiceOfferedDto,
  UpdateServiceOfferedDto,
  SearchServiceOfferedFiltersDto,
} from '@repo/schemas';

@Controller('services-offered')
export class ServiceOfferedController {
  constructor(private readonly serviceOfferedService: ServiceOfferedService) {}

  @RequirePermission('service-offered.read')
  @Get()
  async findAll() {
    return this.serviceOfferedService.findAll();
  }

  @RequirePermission('service-offered.read')
  @Get('search')
  async search(@Query() filters: SearchServiceOfferedFiltersDto) {
    return this.serviceOfferedService.search(filters);
  }

  @RequirePermission('service-offered.read')
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceOfferedService.findById(id);
  }

  @RequirePermission('service-offered.create')
  @Post()
  async create(@Body() data: CreateServiceOfferedDto) {
    return this.serviceOfferedService.create(data);
  }

  @RequirePermission('service-offered.edit')
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateServiceOfferedDto,
  ) {
    return this.serviceOfferedService.update(id, data);
  }

  @RequirePermission('service-offered.edit')
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceOfferedService.remove(id);
  }
}
