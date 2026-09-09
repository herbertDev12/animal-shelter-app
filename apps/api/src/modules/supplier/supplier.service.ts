import { Injectable, NotFoundException } from '@nestjs/common';
import type { Supplier as SupplierRow } from '@prisma/client';
import {
  CreateSupplier,
  SearchSuppliersFilters,
  Supplier,
  SupplierType,
} from '@repo/schemas';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Supplier[]> {
    const rows = await this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(toSupplier);
  }

  async findById(id: number): Promise<Supplier> {
    const row = await this.prisma.supplier.findUnique({
      where: { id_supplier: id },
    });
    if (!row) throw new NotFoundException(`Supplier with ID ${id} not found`);
    return toSupplier(row);
  }

  async search(filters: SearchSuppliersFilters): Promise<Supplier[]> {
    const rows = await this.prisma.supplier.findMany({
      // These filters were exact equality (`=`), not ILIKE — kept as-is.
      where: {
        name: filters.name,
        type: filters.type,
        province: filters.province,
        phone: filters.phone,
        contact_email: filters.contact_email || undefined,
        contact_name: filters.contact_name,
      },
      orderBy: { name: 'asc' },
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toSupplier);
  }

  async create(data: CreateSupplier): Promise<Supplier> {
    const row = await this.prisma.supplier.create({
      data: {
        name: data.name,
        address: data.address ?? null,
        type: data.type,
        phone: data.phone ?? null,
        contact_email: data.contact_email ?? null,
        contact_name: data.contact_name ?? null,
        province: data.province ?? null,
      },
    });
    return toSupplier(row);
  }

  async update(id: number, data: Partial<CreateSupplier>): Promise<Supplier> {
    await this.findById(id);
    const row = await this.prisma.supplier.update({
      where: { id_supplier: id },
      data: {
        name: data.name,
        address: data.address,
        type: data.type,
        phone: data.phone,
        contact_email: data.contact_email,
        contact_name: data.contact_name,
        province: data.province,
      },
    });
    return toSupplier(row);
  }

  async delete(id: number): Promise<boolean> {
    await this.findById(id);
    await this.prisma.supplier.delete({ where: { id_supplier: id } });
    return true;
  }
}

function toSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id_supplier,
    name: row.name,
    address: row.address ?? null,
    type: row.type as SupplierType,
    phone: row.phone ?? null,
    contact_email: row.contact_email ?? null,
    contact_name: row.contact_name ?? null,
    province: row.province ?? null,
  };
}
