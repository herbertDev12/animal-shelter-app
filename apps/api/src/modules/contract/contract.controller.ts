import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequirePermission } from '../auth/permissions.decorator';
import { ContractService } from './contract.service';
import {
  CreateContractDto,
  UpdateContractDto,
  SearchContractsFiltersDto,
} from '@repo/schemas';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @RequirePermission('contract.read')
  @Get()
  async findAll() {
    return this.contractService.findAll();
  }

  @RequirePermission('contract.read')
  @Get('search')
  async search(@Query() filters: SearchContractsFiltersDto) {
    return this.contractService.search(filters);
  }

  @RequirePermission('contract.read')
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractService.findById(id);
  }

  @RequirePermission('contract.create')
  @Post()
  async create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @RequirePermission('contract.edit')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(id, updateContractDto);
  }

  @RequirePermission('contract.edit')
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractService.remove(id);
  }
}
