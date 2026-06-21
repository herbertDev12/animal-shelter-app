import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  Activity,
  CreateActivity,
  UpdateActivity,
  SearchActivityFilters,
} from '@repo/schemas';

interface ActivityRow extends QueryResultRow {
  id_activity: number;
  id_animal: number;
  animal_name: string | null;
  id_service: number;
  service_name: string | null;
  description: string | null;
  date: string;
  time: string | null;
}

@Injectable()
export class ActivityRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Activity[]> {
    const query = `
      SELECT
        act.id_activity,
        act.id_animal,
        a.name as animal_name,
        act.id_service,
        so.name as service_name,
        act.description,
        act.date,
        act.time
      FROM "Activity" act
      INNER JOIN "Animal" a ON act.id_animal = a.id_animal
      INNER JOIN "ServiceOffered" so ON act.id_service = so.id_service
      ORDER BY act.date DESC, act.time DESC
    `;
    return this.query<Activity>(query);
  }

  async findById(id: number): Promise<Activity | null> {
    const query = `
      SELECT
        act.id_activity,
        act.id_animal,
        a.name as animal_name,
        act.id_service,
        so.name as service_name,
        act.description,
        act.date,
        act.time
      FROM "Activity" act
      INNER JOIN "Animal" a ON act.id_animal = a.id_animal
      INNER JOIN "ServiceOffered" so ON act.id_service = so.id_service
      WHERE act.id_activity = $1
    `;
    return this.queryOne<Activity>(query, [id]);
  }

  async search(filters: SearchActivityFilters): Promise<Activity[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.id_animal) {
      paramCount++;
      conditions.push(`act.id_animal = $${paramCount}`);
      params.push(filters.id_animal);
    }

    if (filters.id_service) {
      paramCount++;
      conditions.push(`act.id_service = $${paramCount}`);
      params.push(filters.id_service);
    }

    if (filters.date_from) {
      paramCount++;
      conditions.push(`act.date >= $${paramCount}`);
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      paramCount++;
      conditions.push(`act.date <= $${paramCount}`);
      params.push(filters.date_to);
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
        act.id_activity,
        act.id_animal,
        a.name as animal_name,
        act.id_service,
        so.name as service_name,
        act.description,
        act.date,
        act.time
      FROM "Activity" act
      INNER JOIN "Animal" a ON act.id_animal = a.id_animal
      INNER JOIN "ServiceOffered" so ON act.id_service = so.id_service
      ${whereClause}
      ORDER BY act.date DESC, act.time DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `;

    return this.query<Activity>(query, params);
  }

  private async assertContractActive(id_service: number): Promise<void> {
    const result = await this.queryOne<{ status: string }>(
      `SELECT c.status
       FROM "ServiceOffered" so
       JOIN "Contract" c ON c.id_contract = so.id_contract
       WHERE so.id_service = $1`,
      [id_service],
    );
    if (!result) {
      throw new BadRequestException(
        `Service ${id_service} does not exist or has no contract`,
      );
    }
    if (result.status !== 'Active') {
      throw new BadRequestException(
        `Contract for service ${id_service} is not active (status: ${result.status})`,
      );
    }
  }

  async createActivity(data: CreateActivity): Promise<Activity> {
    await this.assertContractActive(data.id_service);

    const query = `
      INSERT INTO "Activity" (id_animal, id_service, description, date, time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.id_animal,
      data.id_service,
      data.description || null,
      data.date,
      data.time || null,
    ];
    const result = await this.queryOne<ActivityRow>(query, values);
    if (!result) throw new Error('Failed to create Activity');
    return this.enrich(result);
  }

  async updateActivity(id: number, data: UpdateActivity): Promise<Activity> {
    if (data.id_service !== undefined) {
      await this.assertContractActive(data.id_service);
    }

    const updates: string[] = [];
    const values: unknown[] = [id];
    let paramCount = 1;

    const fields: Record<string, string> = {
      id_animal: 'id_animal',
      id_service: 'id_service',
      description: 'description',
      date: 'date',
      time: 'time',
    };

    for (const [key, column] of Object.entries(fields)) {
      if ((data as Record<string, unknown>)[key] !== undefined) {
        paramCount++;
        updates.push(`"${column}" = $${paramCount}`);
        values.push((data as Record<string, unknown>)[key]);
      }
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('Activity not found');
      return existing;
    }

    const query = `
      UPDATE "Activity"
      SET ${updates.join(', ')}
      WHERE id_activity = $1
      RETURNING *
    `;
    const result = await this.queryOne<ActivityRow>(query, values);
    if (!result) throw new Error('Activity not found');
    return this.enrich(result);
  }

  async deleteActivity(id: number): Promise<boolean> {
    const query = 'DELETE FROM "Activity" WHERE id_activity = $1';
    const result = await this.execute(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  private async enrich(row: ActivityRow): Promise<Activity> {
    const enriched = await this.queryOne<{
      animal_name: string | null;
      service_name: string | null;
    }>(
      `SELECT a.name as animal_name, so.name as service_name
       FROM "Animal" a, "ServiceOffered" so
       WHERE a.id_animal = $1 AND so.id_service = $2`,
      [row.id_animal, row.id_service],
    );
    return {
      id_activity: row.id_activity,
      id_animal: row.id_animal,
      animal_name: enriched?.animal_name || null,
      id_service: row.id_service,
      service_name: enriched?.service_name || null,
      description: row.description,
      date: row.date,
      time: row.time,
    };
  }
}
