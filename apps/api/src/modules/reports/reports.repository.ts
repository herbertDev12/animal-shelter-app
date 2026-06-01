import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  ReconciledVeterinarianContract,
  ReconciledVeterinarianContractsResponse,
  FoodSupplierContract,
  FoodSupplierContractsResponse,
} from '@repo/schemas';

@Injectable()
export class ReportsRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  /**
   * Get reconciled veterinarian contracts with JOIN across tables
   * Returns contracts where reconciliation_date IS NOT NULL
   */
  async findReconciledVeterinarianContracts(
    limit: number = 10,
    offset: number = 0,
  ): Promise<ReconciledVeterinarianContractsResponse> {
    const params: unknown[] = [];
    let paramCount = 0;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Contract" ct
      INNER JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier
      WHERE ct.reconciliation_date IS NOT NULL
      AND ct.contract_category = 'Veterinarian';
    `;

    const total = await this.count(countQuery);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const dataQuery = `
     SELECT 
      s.name as veterinarian_name,
      c.name as clinic_name,
      c.province,
      c.address,
      v.specialty,
      ct.start_date,
      ct.end_date,
      ct.reconciliation_date,
      ct.description
     FROM "Contract" ct
     INNER JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier
     INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
     INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
     WHERE ct.reconciliation_date IS NOT NULL
      AND ct.contract_category = 'Veterinarian'
     ORDER BY ct.reconciliation_date DESC
     LIMIT $${paramCount - 1}
     OFFSET $${paramCount}
    `;

    const data = await this.query<ReconciledVeterinarianContract>(
      dataQuery,
      params,
    );

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get food supplier contracts with JOIN across tables
   * Returns contracts where reconciliation_date IS NOT NULL
   */
  async findFoodSupplierContracts(
    limit: number = 10,
    offset: number = 0,
  ): Promise<FoodSupplierContractsResponse> {
    const params: unknown[] = [];
    let paramCount = 0;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Contract" ct
      INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
      WHERE ct.reconciliation_date IS NOT NULL
      AND ct.contract_category = 'Food';
    `;

    const total = await this.count(countQuery);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const dataQuery = `
     SELECT 
      s.name as supplier_name,
      so.food_type,
      s.province,
      s.address,
      ct.start_date,
      ct.end_date,
      ct.reconciliation_date,
      ct.description
     FROM "Contract" ct
     INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
     INNER JOIN "Supplier" s ON ct.id_supplier = s.id_supplier
     WHERE ct.reconciliation_date IS NOT NULL
      AND ct.contract_category = 'Food'
     ORDER BY ct.reconciliation_date DESC
     LIMIT $${paramCount - 1}
     OFFSET $${paramCount}
    `;

    const data = await this.query<FoodSupplierContract>(dataQuery, params);

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
