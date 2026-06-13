import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  Animal,
  AnimalStatus,
  CreateAnimal,
  SearchAnimalsFilters,
} from '@repo/schemas';

interface AnimalRow extends QueryResultRow {
  id_animal: number;
  name: string;
  species: string;
  breed: string | null;
  birth_date: Date | null;
  weight: number | null;
  entry_date: Date;
  status: AnimalStatus;
}

@Injectable()
export class AnimalRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Animal[]> {
    const query = `
      SELECT 
        id_animal as id,
        name,
        species,
        breed,
        birth_date,
        EXTRACT(YEAR FROM AGE(birth_date))::int as age,
        weight,
        entry_date,
        status
      FROM "Animal"
      ORDER BY entry_date DESC
    `;
    return this.query<Animal>(query);
  }

  async findById(id: number): Promise<Animal | null> {
    const query = `
      SELECT 
        id_animal as id,
        name,
        species,
        breed,
        birth_date,
        EXTRACT(YEAR FROM AGE(birth_date))::int as age,
        weight,
        entry_date,
        status
      FROM "Animal"
      WHERE id_animal = $1
    `;
    return this.queryOne<Animal>(query, [id]);
  }

  async search(filters: SearchAnimalsFilters): Promise<Animal[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.species) {
      paramCount++;
      conditions.push(`a.species = $${paramCount}`);
      params.push(filters.species);
    }

    if (filters.breed) {
      paramCount++;
      conditions.push(`a.breed ILIKE $${paramCount}`);
      params.push(`%${filters.breed}%`);
    }

    if (filters.status?.length) {
      paramCount++;
      conditions.push(`a.status = ANY($${paramCount})`);
      params.push(filters.status);
    }

    if (filters.minAge !== undefined) {
      paramCount++;
      conditions.push(`EXTRACT(YEAR FROM AGE(a.birth_date)) >= $${paramCount}`);
      params.push(filters.minAge);
    }

    if (filters.maxAge !== undefined) {
      paramCount++;
      conditions.push(`EXTRACT(YEAR FROM AGE(a.birth_date)) <= $${paramCount}`);
      params.push(filters.maxAge);
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
        id_animal as id,
        name,
        species,
        breed,
        birth_date,
        EXTRACT(YEAR FROM AGE(birth_date))::int as age,
        weight,
        entry_date,
        status
      FROM "Animal" a
      ${whereClause}
      ORDER BY a.entry_date DESC
      LIMIT $${paramCount - 1}
      OFFSET $${paramCount}
    `;

    return this.query<Animal>(query, params);
  }

  async createAnimal(data: CreateAnimal): Promise<Animal> {
    const record: Record<string, unknown> = {
      name: data.name,
      species: data.species,
      breed: data.breed || null,
      status: data.status || 'available',
      entry_date: new Date(),
      weight: data.weight || null,
      birth_date: data.birth_date || null,
    };

    if (data.age !== undefined && !record.birth_date) {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - data.age);
      record.birth_date = birthDate;
    }

    const result = await this.create<AnimalRow>('Animal', record);
    return {
      id: result.id_animal,
      name: result.name,
      species: result.species,
      status: result.status,
      entry_date: result.entry_date,
      breed: result.breed || undefined,
      age: data.age,
      birth_date: result.birth_date || undefined,
      weight: result.weight || undefined,
    };
  }

  async updateAnimal(id: number, data: Partial<CreateAnimal>): Promise<Animal> {
    const record: Record<string, unknown> = { ...data };
    delete record.age;

    if (data.age !== undefined && !data.birth_date) {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - data.age);
      record.birth_date = birthDate;
    }

    const result = await this.update<AnimalRow>('Animal', id, record, {
      idColumn: 'id_animal',
      timestampColumn: '',
    });

    return {
      id: result.id_animal,
      name: result.name,
      species: result.species,
      status: result.status,
      entry_date: result.entry_date,
      breed: result.breed || undefined,
      birth_date: result.birth_date || undefined,
      weight: result.weight || undefined,
    };
  }

  async deleteAnimal(id: number): Promise<boolean> {
    return this.delete('Animal', id, 'id_animal');
  }

  async countByStatus(status: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM "Animal"
      WHERE status = $1
    `;

    return this.count(query, [status]);
  }

  async getAdoptionStats(): Promise<
    Array<{ species: string; available: number; adopted: number }>
  > {
    const query = `
      SELECT 
        species,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'adopted' THEN 1 END) as adopted
      FROM "Animal"
      GROUP BY species
      ORDER BY species
    `;

    return this.query(query);
  }
}
