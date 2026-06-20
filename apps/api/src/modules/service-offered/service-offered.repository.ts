import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  ServiceOffered,
  CreateServiceOffered,
  UpdateServiceOffered,
  SearchServiceOfferedFilters,
} from '@repo/schemas';

interface ServiceOfferedRow extends QueryResultRow {
  id_service: number;
  id_contract: number;
  name: string;
  service_type: string | null;
  food_type: string | null;
}

@Injectable()
export class ServiceOfferedRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<ServiceOffered[]> {
    const query = `
      SELECT id_service, id_contract, name, service_type, food_type
      FROM "ServiceOffered"
      ORDER BY id_service ASC
    `;
    const rows = await this.query<ServiceOfferedRow>(query);
    return rows.map((r) => this.mapRow(r));
  }

  async findById(id: number): Promise<ServiceOffered | null> {
    const query = `
      SELECT id_service, id_contract, name, service_type, food_type
      FROM "ServiceOffered"
      WHERE id_service = $1
    `;
    const row = await this.queryOne<ServiceOfferedRow>(query, [id]);
    return row ? this.mapRow(row) : null;
  }

  async search(
    filters: SearchServiceOfferedFilters,
  ): Promise<ServiceOffered[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.id_contract) {
      paramCount++;
      conditions.push(`id_contract = $${paramCount}`);
      params.push(filters.id_contract);
    }

    if (filters.service_type) {
      paramCount++;
      conditions.push(`service_type = $${paramCount}`);
      params.push(filters.service_type);
    }

    if (filters.food_type) {
      paramCount++;
      conditions.push(`food_type = $${paramCount}`);
      params.push(filters.food_type);
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
      SELECT id_service, id_contract, name, service_type, food_type
      FROM "ServiceOffered"
      ${whereClause}
      ORDER BY id_service ASC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `;

    const rows = await this.query<ServiceOfferedRow>(query, params);
    return rows.map((r) => this.mapRow(r));
  }

  async createServiceOffered(
    data: CreateServiceOffered,
  ): Promise<ServiceOffered> {
    const record: Record<string, unknown> = {
      id_contract: data.id_contract,
      name: data.name,
      service_type: data.service_type || null,
      food_type: data.food_type || null,
    };
    const result = await this.create<ServiceOfferedRow>(
      'ServiceOffered',
      record,
    );
    return this.mapRow(result);
  }

  async updateServiceOffered(
    id: number,
    data: UpdateServiceOffered,
  ): Promise<ServiceOffered> {
    const record: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );
    const result = await this.update<ServiceOfferedRow>(
      'ServiceOffered',
      id,
      record,
      {
        idColumn: 'id_service',
        timestampColumn: null,
      },
    );
    return this.mapRow(result);
  }

  async deleteServiceOffered(id: number): Promise<boolean> {
    return this.delete('ServiceOffered', id, 'id_service');
  }

  private mapRow(row: ServiceOfferedRow): ServiceOffered {
    return {
      id: row.id_service,
      id_contract: row.id_contract,
      name: row.name,
      service_type: row.service_type,
      food_type: row.food_type,
    };
  }
}
