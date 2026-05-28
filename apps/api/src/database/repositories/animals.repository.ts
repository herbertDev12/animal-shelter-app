import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { BaseRepository } from './base.repository';
import { DATABASE_CONNECTION } from '../config/database.config';

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  status: 'available' | 'adopted' | 'reserved';
  created_at: Date;
  updated_at: Date;
}

export interface CreateAnimalDto {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  status?: 'available' | 'adopted' | 'reserved';
}

export interface SearchAnimalsFilters {
  species?: string;
  breed?: string;
  status?: string[];
  minAge?: number;
  maxAge?: number;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AnimalsRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) private pool: Pool) {
    super(pool);
  }

  /**
   * Get all animals with basic info
   */
  async findAll(): Promise<Animal[]> {
    const query = `
      SELECT 
        id,
        name,
        species,
        breed,
        age,
        status,
        created_at,
        updated_at
      FROM animals
      ORDER BY created_at DESC
    `;
    return this.query<Animal>(query);
  }

  /**
   * Find animal by ID
   */
  async findById(id: string): Promise<Animal | null> {
    const query = `
      SELECT 
        id,
        name,
        species,
        breed,
        age,
        status,
        created_at,
        updated_at
      FROM animals
      WHERE id = $1
    `;
    return this.queryOne<Animal>(query, [id]);
  }

  /**
   * Search animals with dynamic filters
   */
  async search(filters: SearchAnimalsFilters): Promise<Animal[]> {
    const conditions: string[] = [];
    const params: any[] = [];
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
      conditions.push(`a.age >= $${paramCount}`);
      params.push(filters.minAge);
    }

    if (filters.maxAge !== undefined) {
      paramCount++;
      conditions.push(`a.age <= $${paramCount}`);
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
        id,
        name,
        species,
        breed,
        age,
        status,
        created_at,
        updated_at
      FROM animals a
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramCount - 1}
      OFFSET $${paramCount}
    `;

    return this.query<Animal>(query, params);
  }

  /**
   * Create a new animal
   */
  async create(data: CreateAnimalDto): Promise<Animal> {
    const query = `
      INSERT INTO animals (
        name,
        species,
        breed,
        age,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING 
        id,
        name,
        species,
        breed,
        age,
        status,
        created_at,
        updated_at
    `;

    const result = await this.queryOne<Animal>(query, [
      data.name,
      data.species,
      data.breed || null,
      data.age || null,
      data.status || 'available',
    ]);

    if (!result) {
      throw new Error('Failed to create animal');
    }

    return result;
  }

  /**
   * Update an animal
   */
  async update(
    id: string,
    data: Partial<CreateAnimalDto>,
  ): Promise<Animal> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(data.name);
    }

    if (data.species !== undefined) {
      paramCount++;
      updates.push(`species = $${paramCount}`);
      params.push(data.species);
    }

    if (data.breed !== undefined) {
      paramCount++;
      updates.push(`breed = $${paramCount}`);
      params.push(data.breed);
    }

    if (data.age !== undefined) {
      paramCount++;
      updates.push(`age = $${paramCount}`);
      params.push(data.age);
    }

    if (data.status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(data.status);
    }

    if (updates.length === 0) {
      const animal = await this.findById(id);
      if (!animal) throw new Error('Animal not found');
      return animal;
    }

    updates.push(`updated_at = NOW()`);
    params.unshift(id);

    const query = `
      UPDATE animals
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING 
        id,
        name,
        species,
        breed,
        age,
        status,
        created_at,
        updated_at
    `;

    const result = await this.queryOne<Animal>(query, params);

    if (!result) {
      throw new Error('Animal not found');
    }

    return result;
  }

  /**
   * Delete an animal
   */
  async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM animals
      WHERE id = $1
    `;

    const result = await this.execute(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Count available animals
   */
  async countByStatus(status: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM animals
      WHERE status = $1
    `;

    return this.count(query, [status]);
  }

  /**
   * Get animals with adoption stats
   */
  async getAdoptionStats(): Promise<
    Array<{ species: string; available: number; adopted: number }>
  > {
    const query = `
      SELECT 
        species,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'adopted' THEN 1 END) as adopted
      FROM animals
      GROUP BY species
      ORDER BY species
    `;

    return this.query(query);
  }
}
