import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  TransportService,
  CreateTransportService,
  UpdateTransportService,
  SearchTransportServicesFilters,
  ContractStatus,
} from '@repo/schemas';

interface TransportServiceRow extends QueryResultRow {
  id?: number;
  id_contract: number;
  id_supplier: number;
  contract_category: string;
  start_date: Date;
  end_date: Date;
  reconciliation_date: Date | null;
  description: string | null;
  status: ContractStatus;
  vehicle: string;
  transport_modality: string;
}

@Injectable()
export class TransportServiceRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<TransportService[]> {
    const query = `
      SELECT 
        c.id_contract as id,
        c.id_supplier,
        c.contract_category,
        c.start_date,
        c.end_date,
        c.reconciliation_date,
        c.description,
        c.status,
        ts.vehicle,
        ts.transport_modality
      FROM "Contract" c
      INNER JOIN "TransportService" ts ON c.id_contract = ts.id_contract
      ORDER BY c.start_date DESC
    `;
    const rows = await this.query<TransportServiceRow>(query);
    return rows.map((row) => this.mapRowToTransportService(row));
  }

  async findById(id: number): Promise<TransportService | null> {
    const query = `
      SELECT 
        c.id_contract as id,
        c.id_supplier,
        c.contract_category,
        c.start_date,
        c.end_date,
        c.reconciliation_date,
        c.description,
        c.status,
        ts.vehicle,
        ts.transport_modality
      FROM "Contract" c
      INNER JOIN "TransportService" ts ON c.id_contract = ts.id_contract
      WHERE c.id_contract = $1
    `;
    const row = await this.queryOne<TransportServiceRow>(query, [id]);
    return row ? this.mapRowToTransportService(row) : null;
  }

  async search(
    filters: SearchTransportServicesFilters,
  ): Promise<TransportService[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.id_supplier) {
      paramCount++;
      conditions.push(`c.id_supplier = $${paramCount}`);
      params.push(filters.id_supplier);
    }

    if (filters.status) {
      paramCount++;
      conditions.push(`c.status = $${paramCount}`);
      params.push(filters.status);
    }

    if (filters.vehicle) {
      paramCount++;
      conditions.push(`ts.vehicle = $${paramCount}`);
      params.push(filters.vehicle);
    }

    if (filters.transport_modality) {
      paramCount++;
      conditions.push(`ts.transport_modality = $${paramCount}`);
      params.push(filters.transport_modality);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

    paramCount++;
    params.push(limit);
    const limitParam = paramCount;

    paramCount++;
    params.push(offset);
    const offsetParam = paramCount;

    const query = `
      SELECT 
        c.id_contract as id,
        c.id_supplier,
        c.contract_category,
        c.start_date,
        c.end_date,
        c.reconciliation_date,
        c.description,
        c.status,
        ts.vehicle,
        ts.transport_modality
      FROM "Contract" c
      INNER JOIN "TransportService" ts ON c.id_contract = ts.id_contract
      ${whereClause}
      ORDER BY c.start_date DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `;

    const rows = await this.query<TransportServiceRow>(query, params);
    return rows.map((row) => this.mapRowToTransportService(row));
  }

  async createTransportService(
    data: CreateTransportService,
  ): Promise<TransportService> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const contractQuery = `
        INSERT INTO "Contract" (
          id_supplier, contract_category, start_date, end_date, 
          reconciliation_date, description, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const contractValues = [
        data.id_supplier,
        'Service',
        data.start_date,
        data.end_date,
        data.reconciliation_date || null,
        data.description || null,
        data.status || 'Active',
      ];
      const contractResult = await client.query(contractQuery, contractValues);
      const contractRow = contractResult.rows[0];

      const tsQuery = `
        INSERT INTO "TransportService" (id_contract, vehicle, transport_modality)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const tsValues = [
        contractRow.id_contract,
        data.vehicle,
        data.transport_modality,
      ];
      const tsResult = await client.query(tsQuery, tsValues);
      const tsRow = tsResult.rows[0];

      await client.query('COMMIT');

      return this.mapRowToTransportService({
        ...contractRow,
        ...tsRow,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateTransportService(
    id: number,
    data: UpdateTransportService,
  ): Promise<TransportService> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const contractFields = [
        'id_supplier',
        'start_date',
        'end_date',
        'reconciliation_date',
        'description',
        'status',
      ];
      const contractUpdates: string[] = [];
      const contractValues: unknown[] = [id];
      let contractParamCount = 1;

      for (const field of contractFields) {
        if (data[field as keyof UpdateTransportService] !== undefined) {
          contractParamCount++;
          contractUpdates.push(`"${field}" = $${contractParamCount}`);
          contractValues.push(data[field as keyof UpdateTransportService]);
        }
      }

      if (contractUpdates.length > 0) {
        await client.query(
          `
          UPDATE "Contract" 
          SET ${contractUpdates.join(', ')}
          WHERE id_contract = $1
        `,
          contractValues,
        );
      }

      const tsFields = ['vehicle', 'transport_modality'];
      const tsUpdates: string[] = [];
      const tsValues: unknown[] = [id];
      let tsParamCount = 1;

      for (const field of tsFields) {
        if (data[field as keyof UpdateTransportService] !== undefined) {
          tsParamCount++;
          tsUpdates.push(`"${field}" = $${tsParamCount}`);
          tsValues.push(data[field as keyof UpdateTransportService]);
        }
      }

      if (tsUpdates.length > 0) {
        await client.query(
          `
          UPDATE "TransportService"
          SET ${tsUpdates.join(', ')}
          WHERE id_contract = $1
        `,
          tsValues,
        );
      }

      await client.query('COMMIT');

      const updated = await this.findById(id);
      if (!updated)
        throw new Error('Failed to retrieve updated TransportService');
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteTransportService(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'DELETE FROM "TransportService" WHERE id_contract = $1',
        [id],
      );

      const result = await client.query(
        'DELETE FROM "Contract" WHERE id_contract = $1',
        [id],
      );

      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapRowToTransportService(row: TransportServiceRow): TransportService {
    return {
      id: row.id || row.id_contract,
      id_supplier: row.id_supplier,
      contract_category: 'Service',
      start_date: row.start_date,
      end_date: row.end_date,
      reconciliation_date: row.reconciliation_date,
      description: row.description,
      status: row.status,
      vehicle: row.vehicle,
      transport_modality: row.transport_modality,
    };
  }
}
