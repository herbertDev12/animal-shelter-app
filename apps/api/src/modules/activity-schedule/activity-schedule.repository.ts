import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  ActivitySchedule,
  CreateActivitySchedule,
  UpdateActivitySchedule,
  SearchActivityScheduleFilters,
} from '@repo/schemas';

interface ActivityScheduleRow extends QueryResultRow {
  id_schedule: number;
  id_animal: number;
  animal_name: string | null;
  id_contract: number;
  activity_type: string | null;
  description: string | null;
  date: string;
  time: string | null;
  duration_days: number;
  additional_surcharge: number;
}

@Injectable()
export class ActivityScheduleRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<ActivitySchedule[]> {
    const query = `
      SELECT
        asch.id_schedule,
        asch.id_animal,
        a.name as animal_name,
        asch.id_contract,
        asch.activity_type,
        asch.description,
        asch.date,
        asch.time,
        asch.duration_days,
        asch.additional_surcharge
      FROM "ActivitySchedule" asch
      INNER JOIN "Animal" a ON asch.id_animal = a.id_animal
      ORDER BY asch.date DESC, asch.time DESC
    `;
    return this.query<ActivitySchedule>(query);
  }

  async findById(id: number): Promise<ActivitySchedule | null> {
    const query = `
      SELECT
        asch.id_schedule,
        asch.id_animal,
        a.name as animal_name,
        asch.id_contract,
        asch.activity_type,
        asch.description,
        asch.date,
        asch.time,
        asch.duration_days,
        asch.additional_surcharge
      FROM "ActivitySchedule" asch
      INNER JOIN "Animal" a ON asch.id_animal = a.id_animal
      WHERE asch.id_schedule = $1
    `;
    return this.queryOne<ActivitySchedule>(query, [id]);
  }

  async search(
    filters: SearchActivityScheduleFilters,
  ): Promise<ActivitySchedule[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.id_animal) {
      paramCount++;
      conditions.push(`asch.id_animal = $${paramCount}`);
      params.push(filters.id_animal);
    }

    if (filters.id_contract) {
      paramCount++;
      conditions.push(`asch.id_contract = $${paramCount}`);
      params.push(filters.id_contract);
    }

    if (filters.activity_type) {
      paramCount++;
      conditions.push(`asch.activity_type = $${paramCount}`);
      params.push(filters.activity_type);
    }

    if (filters.date_from) {
      paramCount++;
      conditions.push(`asch.date >= $${paramCount}`);
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      paramCount++;
      conditions.push(`asch.date <= $${paramCount}`);
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
        asch.id_schedule,
        asch.id_animal,
        a.name as animal_name,
        asch.id_contract,
        asch.activity_type,
        asch.description,
        asch.date,
        asch.time,
        asch.duration_days,
        asch.additional_surcharge
      FROM "ActivitySchedule" asch
      INNER JOIN "Animal" a ON asch.id_animal = a.id_animal
      ${whereClause}
      ORDER BY asch.date DESC, asch.time DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `;

    return this.query<ActivitySchedule>(query, params);
  }

  async createActivitySchedule(
    data: CreateActivitySchedule,
  ): Promise<ActivitySchedule> {
    const query = `
      INSERT INTO "ActivitySchedule" (id_animal, id_contract, activity_type, description, date, time, duration_days, additional_surcharge)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.id_animal,
      data.id_contract,
      data.activity_type || null,
      data.description || null,
      data.date,
      data.time || null,
      data.duration_days ?? 1,
      data.additional_surcharge ?? 0,
    ];
    const result = await this.queryOne<ActivityScheduleRow>(query, values);
    if (!result) throw new Error('Failed to create ActivitySchedule');
    return this.enrich(result);
  }

  async updateActivitySchedule(
    id: number,
    data: UpdateActivitySchedule,
  ): Promise<ActivitySchedule> {
    const updates: string[] = [];
    const values: unknown[] = [id];
    let paramCount = 1;

    const fields: Record<string, string> = {
      id_animal: 'id_animal',
      id_contract: 'id_contract',
      activity_type: 'activity_type',
      description: 'description',
      date: 'date',
      time: 'time',
      duration_days: 'duration_days',
      additional_surcharge: 'additional_surcharge',
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
      if (!existing) throw new Error('ActivitySchedule not found');
      return existing;
    }

    const query = `
      UPDATE "ActivitySchedule"
      SET ${updates.join(', ')}
      WHERE id_schedule = $1
      RETURNING *
    `;
    const result = await this.queryOne<ActivityScheduleRow>(query, values);
    if (!result) throw new Error('ActivitySchedule not found');
    return this.enrich(result);
  }

  async deleteActivitySchedule(id: number): Promise<boolean> {
    const query = 'DELETE FROM "ActivitySchedule" WHERE id_schedule = $1';
    const result = await this.execute(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  private async enrich(row: ActivityScheduleRow): Promise<ActivitySchedule> {
    const animal = await this.queryOne<{ name: string }>(
      'SELECT name FROM "Animal" WHERE id_animal = $1',
      [row.id_animal],
    );
    return {
      id_schedule: row.id_schedule,
      id_animal: row.id_animal,
      animal_name: animal?.name || null,
      id_contract: row.id_contract,
      activity_type: row.activity_type,
      description: row.description,
      date: row.date,
      time: row.time,
      duration_days: row.duration_days,
      additional_surcharge: row.additional_surcharge,
    };
  }
}
