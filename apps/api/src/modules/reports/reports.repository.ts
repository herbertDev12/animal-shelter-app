import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  ReconciledVeterinarianContract,
  ReconciledVeterinarianContractsResponse,
  FoodSupplierContract,
  FoodSupplierContractsResponse,
  ComplementaryServiceContract,
  ComplementaryServiceContractsResponse,
  ActiveVeterinarian,
  ActiveVeterinariansResponse,
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

  /**
   * Get complementary service contracts with JOIN across tables
   * Returns contracts where reconciliation_date IS NOT NULL
   */
  async findComplementaryServiceContracts(
    limit: number = 10,
    offset: number = 0,
  ): Promise<ComplementaryServiceContractsResponse> {
    const params: unknown[] = [];
    let paramCount = 0;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Contract" ct
      INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
      WHERE ct.reconciliation_date IS NOT NULL
      AND ct.contract_category = 'Service';
    `;

    const total = await this.count(countQuery);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const dataQuery = `
     SELECT 
      ct.start_date,
      ct.end_date,
      ct.reconciliation_date,
      ct.description,
      so.service_type,
      so.base_price as cost_per_service,
      s.province
     FROM "Contract" ct
     INNER JOIN "ServiceOffered" so ON ct.id_contract = so.id_contract
     INNER JOIN "Supplier" s ON ct.id_supplier = s.id_supplier
     WHERE ct.reconciliation_date IS NOT NULL
      AND ct.contract_category = 'Service'
     ORDER BY ct.reconciliation_date DESC
     LIMIT $${paramCount - 1}
     OFFSET $${paramCount}
    `;

    const data = await this.query<ComplementaryServiceContract>(
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
   * Get active veterinarians with JOIN across tables
   * Returns veterinarians with active contracts, optionally filtered by clinic and/or province
   */
  async findActiveVeterinarians(
    limit: number = 10,
    offset: number = 0,
    clinic_id?: number,
    province?: string,
  ): Promise<ActiveVeterinariansResponse> {
    const params: unknown[] = [];
    let paramCount = 0;

    const conditions: string[] = [
      `s.type = 'Veterinarian'`,
      `ct.contract_category = 'Veterinarian'`,
      `ct.status = 'Active'`,
    ];

    if (clinic_id) {
      paramCount++;
      params.push(clinic_id);
      conditions.push(`c.id_clinic = $${paramCount}`);
    }

    if (province) {
      paramCount++;
      params.push(province);
      conditions.push(`c.province = $${paramCount}`);
    }

    const whereClause = conditions.join('\n      AND ');

    const countQuery = `
      SELECT COUNT(DISTINCT v.id_supplier) as count
      FROM "Veterinarian" v
      INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
      INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
      INNER JOIN "Contract" ct ON v.id_supplier = ct.id_supplier
      WHERE ${whereClause};
    `;

    const total = await this.count(countQuery, params);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const dataQuery = `
     SELECT
      CURRENT_DATE as date,
      s.name as veterinarian_name,
      c.name as clinic_name,
      c.province,
      v.specialty,
      s.phone,
      v.fax,
      COALESCE(v.veterinarian_email, s.contact_email) as email,
      v.city_distance as distance_to_nearest_city,
      v.modality as modalities
     FROM "Veterinarian" v
     INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
     INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
     INNER JOIN "Contract" ct ON v.id_supplier = ct.id_supplier
     WHERE ${whereClause}
     ORDER BY s.name
     LIMIT $${paramCount - 1}
     OFFSET $${paramCount}
    `;

    const data = await this.query<ActiveVeterinarian>(dataQuery, params);

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
