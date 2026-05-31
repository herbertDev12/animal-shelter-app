import { Injectable } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { ReconciledVeterinarianContractFilters } from '@repo/schemas';

@Injectable()
export class ReportsService {
  constructor(private reportsRepository: ReportsRepository) {}

  async findReconciledVeterinarianContracts(
    filters: ReconciledVeterinarianContractFilters,
  ) {
    return this.reportsRepository.findReconciledVeterinarianContracts(
      filters.limit,
      filters.offset,
    );
  }
}
