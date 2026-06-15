import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  Adoption,
  CreateAdoption,
  SearchAdoptionsFilters,
} from '@repo/schemas';

interface AdoptionRow extends QueryResultRow {
  id_adoption: number;
  id_animal: number;
  adoption_date: Date;
  adoption_price: number | null;
}

@Injectable()
export class AdoptionRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Adoption[]> {
    const query = `
      SELECT
        id_adoption as id,
        id_animal,
        adoption_date,
        adoption_price
      FROM "Adoption"
      ORDER BY adoption_date DESC
    `;
    return this.query<Adoption>(query);
  }

  async findById(id: number): Promise<Adoption | null> {
    const query = `
      SELECT
        id_adoption as id,
        id_animal,
        adoption_date,
        adoption_price
      FROM "Adoption"
      WHERE id_adoption = $1
    `;
    return this.queryOne<Adoption>(query, [id]);
  }

  async search(filters: SearchAdoptionsFilters): Promise<Adoption[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.id_animal) {
      paramCount++;
      conditions.push(`id_animal = $${paramCount}`);
      params.push(filters.id_animal);
    }

    if (filters.startDate) {
      paramCount++;
      conditions.push(`adoption_date >= $${paramCount}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      conditions.push(`adoption_date <= $${paramCount}`);
      params.push(filters.endDate);
    }

    if (filters.minPrice !== undefined) {
      paramCount++;
      conditions.push(`adoption_price >= $${paramCount}`);
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      paramCount++;
      conditions.push(`adoption_price <= $${paramCount}`);
      params.push(filters.maxPrice);
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
        id_adoption as id,
        id_animal,
        adoption_date,
        adoption_price
      FROM "Adoption"
      ${whereClause}
      ORDER BY adoption_date DESC
      LIMIT $${paramCount - 1}
      OFFSET $${paramCount}
    `;

    return this.query<Adoption>(query, params);
  }

  async createAdoption(data: CreateAdoption): Promise<Adoption> {
    const record: Record<string, unknown> = {
      id_animal: data.id_animal,
      adoption_date: data.adoption_date,
      adoption_price: data.adoption_price ?? null,
    };

    const result = await this.create<AdoptionRow>('Adoption', record);
    return {
      id: result.id_adoption,
      id_animal: result.id_animal,
      adoption_date: result.adoption_date,
      adoption_price: result.adoption_price ?? undefined,
    };
  }

  async updateAdoption(
    id: number,
    data: Partial<CreateAdoption>,
  ): Promise<Adoption> {
    const record: Record<string, unknown> = { ...data };

    const result = await this.update<AdoptionRow>('Adoption', id, record, {
      idColumn: 'id_adoption',
      timestampColumn: '',
    });

    return {
      id: result.id_adoption,
      id_animal: result.id_animal,
      adoption_date: result.adoption_date,
      adoption_price: result.adoption_price ?? undefined,
    };
  }

  async deleteAdoption(id: number): Promise<boolean> {
    return this.delete('Adoption', id, 'id_adoption');
  }
}
