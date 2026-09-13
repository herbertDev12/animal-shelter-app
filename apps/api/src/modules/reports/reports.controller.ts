import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermission } from '../auth/permissions.decorator';
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

  @RequirePermission('reports.read')
  @Get('reconciled-veterinarian-contracts')
  async findReconciledVeterinarianContracts(
    @Query() filters: ReconciledVeterinarianContractFiltersDto,
  ) {
    return this.reportsService.findReconciledVeterinarianContracts(filters);
  }

  @RequirePermission('reports.read')
  @Get('food-supplier-contracts')
  async findFoodSupplierContracts(
    @Query() filters: FoodSupplierContractFiltersDto,
  ) {
    return this.reportsService.findFoodSupplierContracts(filters);
  }

  @RequirePermission('reports.read')
  @Get('complementary-service-contracts')
  async findComplementaryServiceContracts(
    @Query() filters: ComplementaryServiceContractFiltersDto,
  ) {
    return this.reportsService.findComplementaryServiceContracts(filters);
  }

  @RequirePermission('reports.read')
  @Get('active-veterinarians')
  async findActiveVeterinarians(
    @Query() filters: ActiveVeterinarianFiltersDto,
  ) {
    return this.reportsService.findActiveVeterinarians(filters);
  }

  @RequirePermission('reports.read')
  @Get('animal-care-schedule')
  async findAnimalCareSchedule(@Query() filters: AnimalCareScheduleFiltersDto) {
    return this.reportsService.findAnimalCareSchedule(filters);
  }

  @RequirePermission('reports.read')
  @Get('revenue-plan')
  async findRevenuePlan(@Query() filters: RevenuePlanFiltersDto) {
    return this.reportsService.findRevenuePlan(filters);
  }
}
