import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from '@repo/schemas';
import { SearchSuppliersFiltersDto } from '@repo/schemas/supplier/supplier.dto';

@Controller('suppliers')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  async findAll() {
    return this.supplierService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchSuppliersFiltersDto) {
    return this.supplierService.search(filters);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateSupplierDto) {
    return this.supplierService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateSupplierDto>,
  ) {
    return this.supplierService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.delete(id);
  }
}
