import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Donation as DonationRow } from '@prisma/client';
import {
  Donation,
  DonationListItem,
  CreateDonation,
  SearchDonationsFilters,
} from '@repo/schemas';
import { numOr0, toDateOnly } from '../../common/prisma-scalars';
import { PrismaService } from '../prisma/prisma.service';

/** List responses name the animal instead of exposing its id. */
const withAnimalName = {
  animal: { select: { name: true } },
} satisfies Prisma.DonationInclude;

type DonationWithAnimalName = Prisma.DonationGetPayload<{
  include: typeof withAnimalName;
}>;

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<DonationListItem[]> {
    const rows = await this.prisma.donation.findMany({
      include: withAnimalName,
      orderBy: [{ date: 'desc' }, { id_donation: 'asc' }],
    });
    return rows.map(toDonationListItem);
  }

  async findById(id: string): Promise<Donation> {
    const row = await this.prisma.donation.findUnique({
      where: { id_donation: id },
    });
    if (!row) throw new NotFoundException(`Donation with ID ${id} not found`);
    return toDonation(row);
  }

  async search(filters: SearchDonationsFilters): Promise<DonationListItem[]> {
    const rows = await this.prisma.donation.findMany({
      where: {
        id_animal: filters.id_animal,
        date: dateRange(filters.startDate, filters.endDate),
        amount: numberRange(filters.minAmount, filters.maxAmount),
        donor: filters.donor
          ? { contains: filters.donor, mode: 'insensitive' }
          : undefined,
      },
      include: withAnimalName,
      orderBy: [{ date: 'desc' }, { id_donation: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toDonationListItem);
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

function donationFields(row: DonationRow) {
  return {
    id: row.id_donation,
    amount: numOr0(row.amount),
    date: row.date,
    donor: row.donor ?? null,
  };
}

function toDonation(row: DonationRow): Donation {
  return { ...donationFields(row), id_animal: row.id_animal };
}

function toDonationListItem(row: DonationWithAnimalName): DonationListItem {
  return { ...donationFields(row), animal_name: row.animal.name };
}
