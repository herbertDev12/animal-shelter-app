import { Injectable } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import {
  ReconciledVeterinarianContractFilters,
  FoodSupplierContractFilters,
  ComplementaryServiceContractFilters,
} from '@repo/schemas';

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

  async findFoodSupplierContracts(filters: FoodSupplierContractFilters) {
    return this.reportsRepository.findFoodSupplierContracts(
      filters.limit,
      filters.offset,
    );
  }

  async findComplementaryServiceContracts(
    filters: ComplementaryServiceContractFilters,
  ) {
    return this.reportsRepository.findComplementaryServiceContracts(
      filters.limit,
      filters.offset,
    );
  }
}
