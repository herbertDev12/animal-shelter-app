import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Adoption as AdoptionRow } from '@prisma/client';
import {
  Adoption,
  AdoptionListItem,
  CreateAdoption,
  SearchAdoptionsFilters,
} from '@repo/schemas';
import { num, toDateOnly } from '../../common/prisma-scalars';
import { PrismaService } from '../prisma/prisma.service';

/** List responses name the animal instead of exposing its id. */
const withAnimalName = {
  animal: { select: { name: true } },
} satisfies Prisma.AdoptionInclude;

type AdoptionWithAnimalName = Prisma.AdoptionGetPayload<{
  include: typeof withAnimalName;
}>;

@Injectable()
export class AdoptionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AdoptionListItem[]> {
    const rows = await this.prisma.adoption.findMany({
      include: withAnimalName,
      orderBy: [{ adoption_date: 'desc' }, { id_adoption: 'asc' }],
    });
    return rows.map(toAdoptionListItem);
  }

  async findById(id: string): Promise<Adoption> {
    const row = await this.prisma.adoption.findUnique({
      where: { id_adoption: id },
    });
    if (!row) throw new NotFoundException(`Adoption with ID ${id} not found`);
    return toAdoption(row);
  }

  async search(filters: SearchAdoptionsFilters): Promise<AdoptionListItem[]> {
    const rows = await this.prisma.adoption.findMany({
      where: {
        id_animal: filters.id_animal,
        adoption_date: dateRange(filters.startDate, filters.endDate),
        adoption_price: numberRange(filters.minPrice, filters.maxPrice),
      },
      include: withAnimalName,
      orderBy: [{ adoption_date: 'desc' }, { id_adoption: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toAdoptionListItem);
  }

  async create(data: CreateAdoption): Promise<Adoption> {
    const row = await this.prisma.adoption.create({
      data: {
        id_animal: data.id_animal,
        adoption_date: toDateOnly(data.adoption_date),
        adoption_price: data.adoption_price ?? null,
      },
    });
    return toAdoption(row);
  }

  async update(id: string, data: Partial<CreateAdoption>): Promise<Adoption> {
    await this.findById(id);
    const row = await this.prisma.adoption.update({
      where: { id_adoption: id },
      data: {
        id_animal: data.id_animal,
        adoption_date: data.adoption_date
          ? toDateOnly(data.adoption_date)
          : undefined,
        adoption_price: data.adoption_price,
      },
    });
    return toAdoption(row);
  }

  async delete(id: string): Promise<boolean> {
    await this.findById(id);
    await this.prisma.adoption.delete({ where: { id_adoption: id } });
    return true;
  }
}

/** `>= start AND <= end` on a date column, omitted when neither bound is given. */
function dateRange(start?: Date, end?: Date) {
  if (!start && !end) return undefined;
  return {
    ...(start && { gte: toDateOnly(start) }),
    ...(end && { lte: toDateOnly(end) }),
  };
}

/** `>= min AND <= max` on a numeric column. */
function numberRange(min?: number, max?: number) {
  if (min === undefined && max === undefined) return undefined;
  return {
    ...(min !== undefined && { gte: min }),
    ...(max !== undefined && { lte: max }),
  };
}

function adoptionFields(row: AdoptionRow) {
  return {
    id: row.id_adoption,
    adoption_date: row.adoption_date,
    adoption_price: num(row.adoption_price) ?? null,
  };
}

function toAdoption(row: AdoptionRow): Adoption {
  return { ...adoptionFields(row), id_animal: row.id_animal };
}

function toAdoptionListItem(row: AdoptionWithAnimalName): AdoptionListItem {
  return { ...adoptionFields(row), animal_name: row.animal.name };
}
