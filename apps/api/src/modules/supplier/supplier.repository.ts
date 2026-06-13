import { Injectable, Inject } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../database/base.repository';
import { DATABASE_CONNECTION } from '../database/config/database.config';
import { CreateSupplier, Supplier, SupplierType } from '@repo/schemas';
import { SearchSuppliersFilters } from '@repo/schemas/supplier/supplier';

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

@Injectable()
export class SupplierRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Supplier[]> {
    const query = `
      SELECT 
        id_supplier as id,
        name,
        address,
        type,
        phone,
        contact_email,
        contact_name,
        province
      FROM "Supplier"
      ORDER BY name ASC
    `;
    return this.query<Supplier>(query);
  }

  async findById(id: number): Promise<Supplier | null> {
    const query = `
      SELECT 
        id_supplier as id,
        name,
        address,
        type,
        phone,
        contact_email,
        contact_name,
        province
      FROM "Supplier"
      WHERE id_supplier = $1
    `;
    return this.queryOne<Supplier>(query, [id]);
  }

  async search(filters: SearchSuppliersFilters): Promise<Supplier[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;

    if (filters.name) {
      paramCount++;
      conditions.push(`s.name = $${paramCount}`);
      params.push(filters.name);
    }

    if (filters.type) {
      paramCount++;
      conditions.push(`s.type = $${paramCount}`);
      params.push(filters.type);
    }

    if (filters.province) {
      paramCount++;
      conditions.push(`s.province = $${paramCount}`);
      params.push(filters.province);
    }

    if (filters.phone) {
      paramCount++;
      conditions.push(`s.phone = $${paramCount}`);
      params.push(filters.phone);
    }

    if (filters.contact_email) {
      paramCount++;
      conditions.push(`s.contact_email = $${paramCount}`);
      params.push(filters.contact_email);
    }

    if (filters.contact_name) {
      paramCount++;
      conditions.push(`s.contact_name = $${paramCount}`);
      params.push(filters.contact_name);
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
          id_supplier as id,
          name,
          address,
          type,
          phone,
          contact_email,
          contact_name,
          province
        FROM "Supplier" s
        ${whereClause}
        ORDER BY s.name ASC
        LIMIT $${paramCount - 1}
        OFFSET $${paramCount}
      `;

    return this.query<Supplier>(query, params);
  }

  async createSupplier(data: CreateSupplier): Promise<Supplier> {
    const record: Record<string, unknown> = {
      name: data.name,
      address: data.address || null,
      type: data.type,
      phone: data.phone || null,
      contact_email: data.contact_email || null,
      contact_name: data.contact_name || null,
      province: data.province || null,
    };

    const result = await this.create<SupplierRow>('Supplier', record);
    return {
      id: result.id_supplier,
      name: result.name,
      address: result.address || undefined,
      type: result.type as SupplierType,
      phone: result.phone || undefined,
      contact_email: result.contact_email || undefined,
      contact_name: result.contact_name || undefined,
      province: result.province || undefined,
    };
  }

  async updateSupplier(
    id: number,
    data: Partial<CreateSupplier>,
  ): Promise<Supplier> {
    const record: Record<string, unknown> = { ...data };

    const result = await this.update<SupplierRow>('Supplier', id, record, {
      idColumn: 'id_supplier',
      timestampColumn: null,
    });

    return {
      id: result.id_supplier,
      name: result.name,
      address: result.address || undefined,
      type: result.type as SupplierType,
      phone: result.phone || undefined,
      contact_email: result.contact_email || undefined,
      contact_name: result.contact_name || undefined,
      province: result.province || undefined,
    };
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return super.delete('Supplier', id, 'id_supplier');
  }
}
