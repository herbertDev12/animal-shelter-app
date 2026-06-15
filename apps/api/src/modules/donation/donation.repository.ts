import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  Donation,
  CreateDonation,
  SearchDonationsFilters,
} from '@repo/schemas';

interface DonationRow extends QueryResultRow {
  id_donation: number;
  id_animal: number;
  amount: number;
  date: Date;
  donor: string | null;
}

@Injectable()
export class DonationRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Donation[]> {
    const query = `
      SELECT
        id_donation as id,
        id_animal,
        amount,
        date,
        donor
      FROM "Donation"
      ORDER BY date DESC
    `;
    return this.query<Donation>(query);
  }

  async findById(id: number): Promise<Donation | null> {
    const query = `
      SELECT
        id_donation as id,
        id_animal,
        amount,
        date,
        donor
      FROM "Donation"
      WHERE id_donation = $1
    `;
    return this.queryOne<Donation>(query, [id]);
  }

  async search(filters: SearchDonationsFilters): Promise<Donation[]> {
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
      conditions.push(`date >= $${paramCount}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      conditions.push(`date <= $${paramCount}`);
      params.push(filters.endDate);
    }

    if (filters.minAmount !== undefined) {
      paramCount++;
      conditions.push(`amount >= $${paramCount}`);
      params.push(filters.minAmount);
    }

    if (filters.maxAmount !== undefined) {
      paramCount++;
      conditions.push(`amount <= $${paramCount}`);
      params.push(filters.maxAmount);
    }

    if (filters.donor) {
      paramCount++;
      conditions.push(`donor ILIKE $${paramCount}`);
      params.push(`%${filters.donor}%`);
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
        id_donation as id,
        id_animal,
        amount,
        date,
        donor
      FROM "Donation"
      ${whereClause}
      ORDER BY date DESC
      LIMIT $${paramCount - 1}
      OFFSET $${paramCount}
    `;

    return this.query<Donation>(query, params);
  }

  async createDonation(data: CreateDonation): Promise<Donation> {
    const record: Record<string, unknown> = {
      id_animal: data.id_animal,
      amount: data.amount,
      date: data.date,
      donor: data.donor ?? null,
    };

    const result = await this.create<DonationRow>('Donation', record);
    return {
      id: result.id_donation,
      id_animal: result.id_animal,
      amount: result.amount,
      date: result.date,
      donor: result.donor ?? undefined,
    };
  }

  async updateDonation(
    id: number,
    data: Partial<CreateDonation>,
  ): Promise<Donation> {
    const record: Record<string, unknown> = { ...data };

    const result = await this.update<DonationRow>('Donation', id, record, {
      idColumn: 'id_donation',
      timestampColumn: '',
    });

    return {
      id: result.id_donation,
      id_animal: result.id_animal,
      amount: result.amount,
      date: result.date,
      donor: result.donor ?? undefined,
    };
  }

  async deleteDonation(id: number): Promise<boolean> {
    return this.delete('Donation', id, 'id_donation');
  }
}
