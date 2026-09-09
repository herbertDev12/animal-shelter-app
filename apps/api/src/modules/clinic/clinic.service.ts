import { Injectable, NotFoundException } from '@nestjs/common';
import type { Clinic as ClinicRow } from '@prisma/client';
import { Clinic, CreateClinic, SearchClinicsFilters } from '@repo/schemas';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Clinic[]> {
    const rows = await this.prisma.clinic.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(toClinic);
  }

  async findById(id: number): Promise<Clinic> {
    const row = await this.prisma.clinic.findUnique({
      where: { id_clinic: id },
    });
    if (!row) throw new NotFoundException(`Clinic with ID ${id} not found`);
    return toClinic(row);
  }

  async search(filters: SearchClinicsFilters): Promise<Clinic[]> {
    const rows = await this.prisma.clinic.findMany({
      where: {
        name: contains(filters.name),
        province: contains(filters.province),
        address: contains(filters.address),
      },
      orderBy: { name: 'asc' },
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toClinic);
  }

  async create(data: CreateClinic): Promise<Clinic> {
    const row = await this.prisma.clinic.create({
      data: {
        name: data.name,
        province: data.province ?? null,
        address: data.address ?? null,
      },
    });
    return toClinic(row);
  }

  async update(id: number, data: Partial<CreateClinic>): Promise<Clinic> {
    await this.findById(id);
    const row = await this.prisma.clinic.update({
      where: { id_clinic: id },
      data: {
        name: data.name,
        province: data.province,
        address: data.address,
      },
    });
    return toClinic(row);
  }

  async delete(id: number): Promise<boolean> {
    await this.findById(id);
    await this.prisma.clinic.delete({ where: { id_clinic: id } });
    return true;
  }
}

/** Case-insensitive partial match, matching the previous `ILIKE '%value%'`. */
function contains(value: string | undefined) {
  return value ? { contains: value, mode: 'insensitive' as const } : undefined;
}

function toClinic(row: ClinicRow): Clinic {
  return {
    id: row.id_clinic,
    name: row.name,
    province: row.province ?? null,
    address: row.address ?? null,
  };
}
