import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import {
  CreateContractDto,
  UpdateContractDto,
  SearchContractsFiltersDto,
} from '@repo/schemas';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  async findAll() {
    return this.contractService.findAll();
  }

  @Get('search')
  async search(@Query() filters: SearchContractsFiltersDto) {
    return this.contractService.search(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractService.findById(id);
  }

  @Post()
  async create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(id, updateContractDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.contractService.remove(id);
  }
}
