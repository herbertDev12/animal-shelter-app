import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  ReconciledVeterinarianContractFiltersDto,
  FoodSupplierContractFiltersDto,
  ComplementaryServiceContractFiltersDto,
  ActiveVeterinarianFiltersDto,
  AnimalCareScheduleFiltersDto,
  RevenuePlanFiltersDto,
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

  @Get('complementary-service-contracts')
  async findComplementaryServiceContracts(
    @Query() filters: ComplementaryServiceContractFiltersDto,
  ) {
    return this.reportsService.findComplementaryServiceContracts(filters);
  }

  @Get('active-veterinarians')
  async findActiveVeterinarians(
    @Query() filters: ActiveVeterinarianFiltersDto,
  ) {
    return this.reportsService.findActiveVeterinarians(filters);
  }

  @Get('animal-care-schedule')
  async findAnimalCareSchedule(@Query() filters: AnimalCareScheduleFiltersDto) {
    return this.reportsService.findAnimalCareSchedule(filters);
  }

  @Get('revenue-plan')
  async findRevenuePlan(@Query() filters: RevenuePlanFiltersDto) {
    return this.reportsService.findRevenuePlan(filters);
  }
}
