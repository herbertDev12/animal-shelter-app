import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  CreateVeterinarian,
  SearchVeterinariansFilters,
  UpdateVeterinarian,
  Veterinarian,
} from '@repo/schemas';
import { num } from '../../common/prisma-scalars';
import { PrismaService } from '../prisma/prisma.service';

/**
 * A veterinarian is the 1:1 subtype of a supplier: the two tables share a
 * primary key, so every read joins them (plus the clinic) and every write
 * touches both.
 */
const withSupplierAndClinic = {
  supplier: true,
  clinic: { select: { name: true, province: true } },
} satisfies Prisma.VeterinarianInclude;

type VeterinarianRow = Prisma.VeterinarianGetPayload<{
  include: typeof withSupplierAndClinic;
}>;

@Injectable()
export class VeterinarianService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Veterinarian[]> {
    const rows = await this.prisma.veterinarian.findMany({
      include: withSupplierAndClinic,
      orderBy: [{ supplier: { name: 'asc' } }, { id_supplier: 'asc' }],
    });
    return rows.map(toVeterinarian);
  }

  async findById(id: number): Promise<Veterinarian> {
    const row = await this.prisma.veterinarian.findUnique({
      where: { id_supplier: id },
      include: withSupplierAndClinic,
    });
    if (!row) {
      throw new NotFoundException(`Veterinarian with ID ${id} not found`);
    }
    return toVeterinarian(row);
  }

  async search(filters: SearchVeterinariansFilters): Promise<Veterinarian[]> {
    const rows = await this.prisma.veterinarian.findMany({
      where: {
        id_clinic: filters.id_clinic,
        modality: filters.modality,
        specialty: filters.specialty,
        // `province` filtered the supplier, not the clinic.
        supplier: filters.province
          ? { is: { province: filters.province } }
          : undefined,
      },
      include: withSupplierAndClinic,
      orderBy: [{ supplier: { name: 'asc' } }, { id_supplier: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toVeterinarian);
  }

  async create(data: CreateVeterinarian): Promise<Veterinarian> {
    // A nested create is atomic by construction, replacing the hand-rolled
    // BEGIN/COMMIT that inserted the supplier and then the veterinarian.
    const supplier = await this.prisma.supplier.create({
      data: {
        name: data.name,
        address: data.address ?? null,
        type: 'Veterinarian',
        phone: data.phone ?? null,
        contact_email: data.contact_email ?? null,
        contact_name: data.contact_name ?? null,
        province: data.province ?? null,
        veterinarian: {
          create: {
            id_clinic: data.id_clinic,
            modality: data.modality ?? null,
            specialty: data.specialty ?? null,
            fax: data.fax ?? null,
            veterinarian_email: data.veterinarian_email ?? null,
            city_distance: data.city_distance ?? null,
          },
        },
      },
      select: { id_supplier: true },
    });
    return this.findById(supplier.id_supplier);
  }

  async update(id: number, data: UpdateVeterinarian): Promise<Veterinarian> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.veterinarian.findUnique({
        where: { id_supplier: id },
      });
      if (!existing) {
        throw new NotFoundException(`Veterinarian with ID ${id} not found`);
      }

      await tx.supplier.update({
        where: { id_supplier: id },
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          contact_email: data.contact_email,
          contact_name: data.contact_name,
          province: data.province,
        },
      });

      await tx.veterinarian.update({
        where: { id_supplier: id },
        data: {
          id_clinic: data.id_clinic,
          modality: data.modality,
          specialty: data.specialty,
          fax: data.fax,
          veterinarian_email: data.veterinarian_email,
          city_distance: data.city_distance,
        },
      });
    });

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.veterinarian.findUnique({
        where: { id_supplier: id },
      });
      if (!existing) {
        throw new NotFoundException(`Veterinarian with ID ${id} not found`);
      }
      // Child first — the supplier row is the parent of the shared key.
      await tx.veterinarian.delete({ where: { id_supplier: id } });
      await tx.supplier.delete({ where: { id_supplier: id } });
      return true;
    });
  }
}

function toVeterinarian(row: VeterinarianRow): Veterinarian {
  return {
    id: row.id_supplier,
    name: row.supplier.name,
    address: row.supplier.address,
    type: 'Veterinarian',
    phone: row.supplier.phone,
    contact_email: row.supplier.contact_email,
    contact_name: row.supplier.contact_name,
    province: row.supplier.province,
    id_clinic: row.id_clinic,
    clinic_name: row.clinic.name,
    clinic_province: row.clinic.province,
    modality: row.modality,
    specialty: row.specialty,
    fax: row.fax,
    veterinarian_email: row.veterinarian_email,
    city_distance: num(row.city_distance),
  };
}
