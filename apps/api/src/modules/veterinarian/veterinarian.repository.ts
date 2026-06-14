import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import {
  Veterinarian,
  CreateVeterinarian,
  UpdateVeterinarian,
  SearchVeterinariansFilters,
} from '@repo/schemas';

interface SupplierRow extends QueryResultRow {
  id_supplier: number;
  name: string;
  address: string | null;
  type: string;
  phone: string | null;
  contact_email: string | null;
  contact_name: string | null;
  province: string | null;
}

interface VeterinarianTableRow extends QueryResultRow {
  id_supplier: number;
  id_clinic: number;
  modality: string | null;
  specialty: string | null;
  fax: string | null;
  veterinarian_email: string | null;
  city_distance: number | null;
}

interface VeterinarianRow extends SupplierRow, VeterinarianTableRow {}

@Injectable()
export class VeterinarianRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Veterinarian[]> {
    const query = `
      SELECT
        v.id_supplier as id,
        s.name,
        s.address,
        s.type,
        s.phone,
        s.contact_email,
        s.contact_name,
        s.province,
        v.id_clinic,
        c.name as clinic_name,
        c.province as clinic_province,
        v.modality,
        v.specialty,
        v.fax,
        v.veterinarian_email,
        v.city_distance
      FROM "Veterinarian" v
      INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
      INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
      ORDER BY s.name ASC
    `;
    return this.query<Veterinarian>(query);
  }

  async findById(id: number): Promise<Veterinarian | null> {
    const query = `
      SELECT
        v.id_supplier as id,
        s.name,
        s.address,
        s.type,
        s.phone,
        s.contact_email,
        s.contact_name,
        s.province,
        v.id_clinic,
        c.name as clinic_name,
        c.province as clinic_province,
        v.modality,
        v.specialty,
        v.fax,
        v.veterinarian_email,
        v.city_distance
      FROM "Veterinarian" v
      INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
      INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
      WHERE v.id_supplier = $1
    `;
    return this.queryOne<Veterinarian>(query, [id]);
  }

  async search(filters: SearchVeterinariansFilters): Promise<Veterinarian[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.id_clinic) {
      paramCount++;
      conditions.push(`v.id_clinic = $${paramCount}`);
      params.push(filters.id_clinic);
    }

    if (filters.modality) {
      paramCount++;
      conditions.push(`v.modality = $${paramCount}`);
      params.push(filters.modality);
    }

    if (filters.specialty) {
      paramCount++;
      conditions.push(`v.specialty = $${paramCount}`);
      params.push(filters.specialty);
    }

    if (filters.province) {
      paramCount++;
      conditions.push(`s.province = $${paramCount}`);
      params.push(filters.province);
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
        v.id_supplier as id,
        s.name,
        s.address,
        s.type,
        s.phone,
        s.contact_email,
        s.contact_name,
        s.province,
        v.id_clinic,
        c.name as clinic_name,
        c.province as clinic_province,
        v.modality,
        v.specialty,
        v.fax,
        v.veterinarian_email,
        v.city_distance
      FROM "Veterinarian" v
      INNER JOIN "Supplier" s ON v.id_supplier = s.id_supplier
      INNER JOIN "Clinic" c ON v.id_clinic = c.id_clinic
      ${whereClause}
      ORDER BY s.name ASC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `;

    return this.query<Veterinarian>(query, params);
  }

  async createVeterinarian(data: CreateVeterinarian): Promise<Veterinarian> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const supplierQuery = `
        INSERT INTO "Supplier" (name, address, type, phone, contact_email, contact_name, province)
        VALUES ($1, $2, 'Veterinarian', $3, $4, $5, $6)
        RETURNING *
      `;
      const supplierValues = [
        data.name,
        data.address || null,
        data.phone || null,
        data.contact_email || null,
        data.contact_name || null,
        data.province || null,
      ];
      const supplierResult = await client.query<SupplierRow>(
        supplierQuery,
        supplierValues,
      );
      const supplierRow = supplierResult.rows[0];

      const vetQuery = `
        INSERT INTO "Veterinarian" (id_supplier, id_clinic, modality, specialty, fax, veterinarian_email, city_distance)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const vetValues = [
        supplierRow.id_supplier,
        data.id_clinic,
        data.modality || null,
        data.specialty || null,
        data.fax || null,
        data.veterinarian_email || null,
        data.city_distance ?? null,
      ];
      const vetResult = await client.query<VeterinarianTableRow>(
        vetQuery,
        vetValues,
      );
      const vetRow = vetResult.rows[0];

      await client.query('COMMIT');

      return this.mapRowToVeterinarian({ ...supplierRow, ...vetRow });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateVeterinarian(
    id: number,
    data: UpdateVeterinarian,
  ): Promise<Veterinarian> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const supplierFields = [
        'name',
        'address',
        'phone',
        'contact_email',
        'contact_name',
        'province',
      ];
      const supplierUpdates: string[] = [];
      const supplierValues: unknown[] = [id];
      let supplierParamCount = 1;

      for (const field of supplierFields) {
        if ((data as Record<string, unknown>)[field] !== undefined) {
          supplierParamCount++;
          supplierUpdates.push(`"${field}" = $${supplierParamCount}`);
          supplierValues.push((data as Record<string, unknown>)[field]);
        }
      }

      if (supplierUpdates.length > 0) {
        await client.query(
          `
          UPDATE "Supplier"
          SET ${supplierUpdates.join(', ')}
          WHERE id_supplier = $1
        `,
          supplierValues,
        );
      }

      const vetFields = [
        'id_clinic',
        'modality',
        'specialty',
        'fax',
        'veterinarian_email',
        'city_distance',
      ];
      const vetUpdates: string[] = [];
      const vetValues: unknown[] = [id];
      let vetParamCount = 1;

      for (const field of vetFields) {
        if ((data as Record<string, unknown>)[field] !== undefined) {
          vetParamCount++;
          vetUpdates.push(`"${field}" = $${vetParamCount}`);
          vetValues.push((data as Record<string, unknown>)[field]);
        }
      }

      if (vetUpdates.length > 0) {
        await client.query(
          `
          UPDATE "Veterinarian"
          SET ${vetUpdates.join(', ')}
          WHERE id_supplier = $1
        `,
          vetValues,
        );
      }

      await client.query('COMMIT');

      const updated = await this.findById(id);
      if (!updated) throw new Error('Failed to retrieve updated Veterinarian');
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteVeterinarian(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM "Veterinarian" WHERE id_supplier = $1', [
        id,
      ]);

      const result = await client.query(
        'DELETE FROM "Supplier" WHERE id_supplier = $1',
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

  private mapRowToVeterinarian(row: VeterinarianRow): Veterinarian {
    return {
      id: row.id_supplier,
      name: row.name,
      address: row.address,
      type: 'Veterinarian',
      phone: row.phone,
      contact_email: row.contact_email,
      contact_name: row.contact_name,
      province: row.province,
      id_clinic: row.id_clinic,
      clinic_name: null,
      clinic_province: null,
      modality: row.modality,
      specialty: row.specialty,
      fax: row.fax,
      veterinarian_email: row.veterinarian_email,
      city_distance: row.city_distance,
    };
  }
}
