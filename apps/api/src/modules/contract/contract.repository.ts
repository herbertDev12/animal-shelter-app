import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  Contract,
  CreateContract,
  UpdateContract,
  SearchContractsFilters,
  ContractCategory,
  ContractStatus,
} from '@repo/schemas';

interface ContractRow extends QueryResultRow {
  id_contract: number;
  id_supplier: number;
  contract_category: string;
  start_date: Date;
  end_date: Date;
  reconciliation_date: Date | null;
  description: string | null;
  status: string;
  base_price: string;
}

@Injectable()
export class ContractRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Contract[]> {
    const query = `
      SELECT 
        id_contract as id,
        id_supplier,
        contract_category,
        start_date,
        end_date,
        reconciliation_date,
        description,
        status,
        base_price::float8 as base_price
      FROM "Contract"
      ORDER BY start_date DESC
    `;
    return this.query<Contract>(query);
  }

  async findById(id: number): Promise<Contract | null> {
    const query = `
      SELECT 
        id_contract as id,
        id_supplier,
        contract_category,
        start_date,
        end_date,
        reconciliation_date,
        description,
        status,
        base_price::float8 as base_price
      FROM "Contract"
      WHERE id_contract = $1
    `;
    return this.queryOne<Contract>(query, [id]);
  }

  async search(filters: SearchContractsFilters): Promise<Contract[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.id_supplier) {
      paramCount++;
      conditions.push(`c.id_supplier = $${paramCount}`);
      params.push(filters.id_supplier);
    }

    if (filters.contract_category) {
      paramCount++;
      conditions.push(`c.contract_category = $${paramCount}`);
      params.push(filters.contract_category);
    }

    if (filters.status) {
      paramCount++;
      conditions.push(`c.status = $${paramCount}`);
      params.push(filters.status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

    paramCount++;
    params.push(limit);

    paramCount++;
    params.push(offset);

    const query = `
      SELECT 
        id_contract as id,
        id_supplier,
        contract_category,
        start_date,
        end_date,
        reconciliation_date,
        description,
        status,
        base_price::float8 as base_price
      FROM "Contract" c
      ${whereClause}
      ORDER BY c.start_date DESC
      LIMIT $${paramCount - 1}
      OFFSET $${paramCount}
    `;

    return this.query<Contract>(query, params);
  }

  async createContract(data: CreateContract): Promise<Contract> {
    const record: Record<string, unknown> = {
      id_supplier: data.id_supplier,
      contract_category: data.contract_category,
      start_date: data.start_date,
      end_date: data.end_date,
      reconciliation_date: data.reconciliation_date || null,
      description: data.description || null,
      status: data.status || 'Active',
      base_price: data.base_price,
    };

    const result = await this.create<ContractRow>('Contract', record);
    return {
      id: result.id_contract,
      id_supplier: result.id_supplier,
      contract_category: result.contract_category as ContractCategory,
      start_date: result.start_date,
      end_date: result.end_date,
      reconciliation_date: result.reconciliation_date || undefined,
      description: result.description || undefined,
      status: result.status as ContractStatus,
      base_price: parseFloat(result.base_price),
    };
  }

  async updateContract(id: number, data: UpdateContract): Promise<Contract> {
    const record: Record<string, unknown> = { ...data };

    const result = await this.update<ContractRow>('Contract', id, record, {
      idColumn: 'id_contract',
      timestampColumn: null,
    });

    return {
      id: result.id_contract,
      id_supplier: result.id_supplier,
      contract_category: result.contract_category as ContractCategory,
      start_date: result.start_date,
      end_date: result.end_date,
      reconciliation_date: result.reconciliation_date || undefined,
      description: result.description || undefined,
      status: result.status as ContractStatus,
      base_price: parseFloat(result.base_price),
    };
  }

  async deleteContract(id: number): Promise<boolean> {
    return this.delete('Contract', id, 'id_contract');
  }
}
