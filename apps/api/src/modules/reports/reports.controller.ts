import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  ReconciledVeterinarianContractFiltersDto,
  FoodSupplierContractFiltersDto,
} from '@repo/schemas';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('reconciled-veterinarian-contracts')
  async findReconciledVeterinarianContracts(
    @Query() filters: ReconciledVeterinarianContractFiltersDto,
  ) {
    return this.reportsService.findReconciledVeterinarianContracts(filters);
  }

  @Get('food-supplier-contracts')
  async findFoodSupplierContracts(
    @Query() filters: FoodSupplierContractFiltersDto,
  ) {
    return this.reportsService.findFoodSupplierContracts(filters);
  }
}
