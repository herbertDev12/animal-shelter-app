import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReconciledVeterinarianContractFiltersDto } from '@repo/schemas';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('reconciled-veterinarian-contracts')
  async findReconciledVeterinarianContracts(
    @Query() filters: ReconciledVeterinarianContractFiltersDto,
  ) {
    return this.reportsService.findReconciledVeterinarianContracts(filters);
  }
}
