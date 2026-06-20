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
  AnimalCareSchedule,
  AnimalCareScheduleResponse,
  RevenuePlan,
  RevenuePlanResponse,
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
      ct.base_price as cost_per_service,
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

  /**
   * Get care activity schedule for an animal
   * Returns activity schedule entries with animal info, pricing, and totals
   */
  async findAnimalCareSchedule(
    limit: number = 10,
    offset: number = 0,
    id_animal: number,
  ): Promise<AnimalCareScheduleResponse> {
    const params: unknown[] = [];
    let paramCount = 0;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "ActivitySchedule" asched
      INNER JOIN "Animal" a ON asched.id_animal = a.id_animal
      WHERE a.id_animal = $1;
    `;

    paramCount++;
    params.push(id_animal);

    const total = await this.count(countQuery, params);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const mainQuery = `
      SELECT
        a.name              as animal_name,
        a.species,
        a.breed,
        EXTRACT(YEAR FROM age(CURRENT_DATE, a.birth_date))::int as age,
        a.weight,
        (CURRENT_DATE - a.entry_date)::int                      as days_in_shelter,
        asched.date         as "day",
        asched.time         as hour,
        asched.description  as activity_description,
        COALESCE(ct.base_price, 0) + COALESCE(ct.surcharge, 0) as price,
        vet_s.name          as assigned_veterinarian_name,
        food_so.food_type   as assigned_food_type,

        (SELECT COALESCE(SUM(COALESCE(ct_vet.base_price, 0) + COALESCE(ct_vet.surcharge, 0)), 0)
         FROM "ActivitySchedule" asched_vet
         INNER JOIN "Contract" ct_vet ON asched_vet.id_contract = ct_vet.id_contract
         WHERE asched_vet.id_animal = a.id_animal
           AND ct_vet.contract_category = 'Veterinarian'
        ) as total_veterinary_care_price,

        (SELECT COALESCE(SUM(COALESCE(ct_transp.base_price, 0) + COALESCE(ct_transp.surcharge, 0)), 0)
         FROM "ActivitySchedule" asched_transp
         INNER JOIN "Contract" ct_transp ON asched_transp.id_contract = ct_transp.id_contract
         INNER JOIN "TransportService" ts ON ct_transp.id_contract = ts.id_contract
         WHERE asched_transp.id_animal = a.id_animal
        ) as transport_price,

        (SELECT COALESCE(SUM(COALESCE(ct_food.base_price, 0) + COALESCE(ct_food.surcharge, 0)), 0)
         FROM "ActivitySchedule" asched_food
         INNER JOIN "Contract" ct_food ON asched_food.id_contract = ct_food.id_contract
         WHERE asched_food.id_animal = a.id_animal
           AND ct_food.contract_category = 'Food'
        ) as total_food_price,

        (SELECT sc.maintenance_percentage FROM "ShelterConfiguration" sc LIMIT 1) as maintenance_percentage

      FROM "Animal" a
      INNER JOIN "ActivitySchedule" asched ON a.id_animal = asched.id_animal
      LEFT JOIN "Contract" ct ON asched.id_contract = ct.id_contract
      LEFT JOIN "Veterinarian" v ON ct.id_supplier = v.id_supplier
        AND ct.contract_category = 'Veterinarian'
      LEFT JOIN "Supplier" vet_s ON v.id_supplier = vet_s.id_supplier
      LEFT JOIN "ServiceOffered" food_so ON ct.id_contract = food_so.id_contract
        AND ct.contract_category = 'Food'
      WHERE a.id_animal = $1
      ORDER BY asched.date, asched.time
      LIMIT $${paramCount - 2}
      OFFSET $${paramCount - 1}
    `;

    const rows = await this.query<AnimalCareSchedule>(mainQuery, params);

    const data = rows.map((row) => ({
      ...row,
      total_maintenance_cost:
        (row.total_veterinary_care_price +
          row.transport_price +
          row.total_food_price +
          row.price) *
        (1 + (row.maintenance_percentage ?? 0) / 100),
    }));

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get revenue plan from adoptions and donations
   * Returns per-animal summary with maintenance costs, adoption fees, donations, and total revenue
   */
  async findRevenuePlan(
    limit: number = 10,
    offset: number = 0,
  ): Promise<RevenuePlanResponse> {
    const params: unknown[] = [];
    let paramCount = 0;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Animal" a;
    `;

    const total = await this.count(countQuery);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const dataQuery = `
      SELECT
        a.name as animal_name,
        a.species,
        a.breed,
        EXTRACT(YEAR FROM age(CURRENT_DATE, a.birth_date))::int as age,
        (
          SELECT COALESCE(SUM(COALESCE(ct.base_price, 0) + COALESCE(ct.surcharge, 0)), 0)
          FROM "ActivitySchedule" asched
          LEFT JOIN "Contract" ct ON asched.id_contract = ct.id_contract
          WHERE asched.id_animal = a.id_animal
        ) * (1 + COALESCE((SELECT maintenance_percentage FROM "ShelterConfiguration" LIMIT 1), 0) / 100)
        as total_maintenance_cost,
        COALESCE(
          (SELECT SUM(adp.adoption_price) FROM "Adoption" adp WHERE adp.id_animal = a.id_animal),
          0
        ) as total_adoption_fee,
        COALESCE(
          (SELECT SUM(d.amount) FROM "Donation" d WHERE d.id_animal = a.id_animal),
          0
        ) as total_donations,
        (
          COALESCE(
            (SELECT SUM(adp.adoption_price) FROM "Adoption" adp WHERE adp.id_animal = a.id_animal),
            0
          )
          +
          COALESCE(
            (SELECT SUM(d.amount) FROM "Donation" d WHERE d.id_animal = a.id_animal),
            0
          )
        ) as total_revenue
      FROM "Animal" a
      ORDER BY a.name
      LIMIT $${paramCount - 1}
      OFFSET $${paramCount}
    `;

    const data = await this.query<RevenuePlan>(dataQuery, params);

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
