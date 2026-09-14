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
import { TransportServiceService } from './transport-service.service';
import {
  CreateTransportServiceDto,
  UpdateTransportServiceDto,
  SearchTransportServicesFiltersDto,
} from '@repo/schemas';

@Controller('transport-services')
export class TransportServiceController {
  constructor(private transportServiceService: TransportServiceService) {}

  @RequirePermission('transport-service.read')
  @Get()
  async findAll() {
    return this.transportServiceService.findAll();
  }

  @RequirePermission('transport-service.read')
  @Get('search')
  async search(@Query() filters: SearchTransportServicesFiltersDto) {
    return this.transportServiceService.search(filters);
  }

  @RequirePermission('transport-service.read')
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.transportServiceService.findById(id);
  }

  @RequirePermission('transport-service.create')
  @Post()
  async create(@Body() data: CreateTransportServiceDto) {
    return this.transportServiceService.create(data);
  }

  @RequirePermission('transport-service.edit')
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateTransportServiceDto,
  ) {
    return this.transportServiceService.update(id, data);
  }

  @RequirePermission('transport-service.edit')
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.transportServiceService.delete(id);
  }
}
