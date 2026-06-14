import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import { Clinic, CreateClinic, SearchClinicsFilters } from '@repo/schemas';

interface ClinicRow extends QueryResultRow {
  id_clinic: number;
  name: string;
  province: string | null;
  address: string | null;
}

@Injectable()
export class ClinicRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Clinic[]> {
    const query = `
      SELECT 
        id_clinic as id,
        name,
        province,
        address
      FROM "Clinic"
      ORDER BY name ASC
    `;
    return this.query<Clinic>(query);
  }

  async findById(id: number): Promise<Clinic | null> {
    const query = `
      SELECT 
        id_clinic as id,
        name,
        province,
        address
      FROM "Clinic"
      WHERE id_clinic = $1
    `;
    return this.queryOne<Clinic>(query, [id]);
  }

  async search(filters: SearchClinicsFilters): Promise<Clinic[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.name) {
      paramCount++;
      conditions.push(`c.name ILIKE $${paramCount}`);
      params.push(`%${filters.name}%`);
    }

    if (filters.province) {
      paramCount++;
      conditions.push(`c.province ILIKE $${paramCount}`);
      params.push(`%${filters.province}%`);
    }

    if (filters.address) {
      paramCount++;
      conditions.push(`c.address ILIKE $${paramCount}`);
      params.push(`%${filters.address}%`);
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
        id_clinic as id,
        name,
        province,
        address
      FROM "Clinic" c
      ${whereClause}
      ORDER BY c.name ASC
      LIMIT $${paramCount - 1}
      OFFSET $${paramCount}
    `;

    return this.query<Clinic>(query, params);
  }

  async createClinic(data: CreateClinic): Promise<Clinic> {
    const record: Record<string, unknown> = {
      name: data.name,
      province: data.province || null,
      address: data.address || null,
    };

    const result = await this.create<ClinicRow>('Clinic', record);
    return {
      id: result.id_clinic,
      name: result.name,
      province: result.province || undefined,
      address: result.address || undefined,
    };
  }

  async updateClinic(id: number, data: Partial<CreateClinic>): Promise<Clinic> {
    const record: Record<string, unknown> = { ...data };

    const result = await this.update<ClinicRow>('Clinic', id, record, {
      idColumn: 'id_clinic',
      timestampColumn: '',
    });

    return {
      id: result.id_clinic,
      name: result.name,
      province: result.province || undefined,
      address: result.address || undefined,
    };
  }

  async deleteClinic(id: number): Promise<boolean> {
    return this.delete('Clinic', id, 'id_clinic');
  }
}
