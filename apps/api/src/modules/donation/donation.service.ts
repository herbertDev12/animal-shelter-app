import { Injectable, NotFoundException } from '@nestjs/common';
import type { Donation as DonationRow } from '@prisma/client';
import {
  Donation,
  CreateDonation,
  SearchDonationsFilters,
} from '@repo/schemas';
import { numOr0, toDateOnly } from '../../common/prisma-scalars';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Donation[]> {
    const rows = await this.prisma.donation.findMany({
      orderBy: [{ date: 'desc' }, { id_donation: 'asc' }],
    });
    return rows.map(toDonation);
  }

  async findById(id: string): Promise<Donation> {
    const row = await this.prisma.donation.findUnique({
      where: { id_donation: id },
    });
    if (!row) throw new NotFoundException(`Donation with ID ${id} not found`);
    return toDonation(row);
  }

  async search(filters: SearchDonationsFilters): Promise<Donation[]> {
    const rows = await this.prisma.donation.findMany({
      where: {
        id_animal: filters.id_animal,
        date: dateRange(filters.startDate, filters.endDate),
        amount: numberRange(filters.minAmount, filters.maxAmount),
        donor: filters.donor
          ? { contains: filters.donor, mode: 'insensitive' }
          : undefined,
      },
      orderBy: [{ date: 'desc' }, { id_donation: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toDonation);
  }

  async create(data: CreateDonation): Promise<Donation> {
    const row = await this.prisma.donation.create({
      data: {
        id_animal: data.id_animal,
        amount: data.amount,
        date: toDateOnly(data.date),
        donor: data.donor ?? null,
      },
    });
    return toDonation(row);
  }

  async update(id: string, data: Partial<CreateDonation>): Promise<Donation> {
    await this.findById(id);
    const row = await this.prisma.donation.update({
      where: { id_donation: id },
      data: {
        id_animal: data.id_animal,
        amount: data.amount,
        date: data.date ? toDateOnly(data.date) : undefined,
        donor: data.donor,
      },
    });
    return toDonation(row);
  }

  async delete(id: string): Promise<boolean> {
    await this.findById(id);
    await this.prisma.donation.delete({ where: { id_donation: id } });
    return true;
  }
}

function dateRange(start?: Date, end?: Date) {
  if (!start && !end) return undefined;
  return {
    ...(start && { gte: toDateOnly(start) }),
    ...(end && { lte: toDateOnly(end) }),
  };
}

function numberRange(min?: number, max?: number) {
  if (min === undefined && max === undefined) return undefined;
  return {
    ...(min !== undefined && { gte: min }),
    ...(max !== undefined && { lte: max }),
  };
}

function toDonation(row: DonationRow): Donation {
  return {
    id: row.id_donation,
    id_animal: row.id_animal,
    amount: numOr0(row.amount),
    date: row.date,
    donor: row.donor ?? null,
  };
}
