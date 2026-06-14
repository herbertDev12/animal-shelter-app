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
import { TransportServiceService } from './transport-service.service';
import {
  CreateTransportServiceDto,
  UpdateTransportServiceDto,
  SearchTransportServicesFiltersDto,
} from '@repo/schemas';

@Controller('transport-services')
export class TransportServiceController {
  constructor(private transportServiceService: TransportServiceService) {}

  @Get()
  async findAll() {
    return this.transportServiceService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchTransportServicesFiltersDto) {
    return this.transportServiceService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.transportServiceService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateTransportServiceDto) {
    return this.transportServiceService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTransportServiceDto,
  ) {
    return this.transportServiceService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.transportServiceService.delete(id);
  }
}
