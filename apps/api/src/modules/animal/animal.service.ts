import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Animal as AnimalRow, Prisma } from '@prisma/client';
import {
  Animal,
  AnimalStatus,
  CreateAnimal,
  SearchAnimalsFilters,
} from '@repo/schemas';
import {
  completedYears,
  num,
  subYears,
  toDateOnly,
  todayUtc,
} from '../../common/prisma-scalars';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnimalService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Animal[]> {
    const rows = await this.prisma.animal.findMany({
      orderBy: [{ entry_date: 'desc' }, { id_animal: 'asc' }],
    });
    return rows.map(toAnimal);
  }

  async findById(id: number): Promise<Animal> {
    const row = await this.prisma.animal.findUnique({
      where: { id_animal: id },
    });
    if (!row) throw new NotFoundException(`Animal with ID ${id} not found`);
    return toAnimal(row);
  }

  async search(filters: SearchAnimalsFilters): Promise<Animal[]> {
    const rows = await this.prisma.animal.findMany({
      where: {
        species: filters.species,
        breed: filters.breed
          ? { contains: filters.breed, mode: 'insensitive' }
          : undefined,
        status: filters.status?.length ? { in: filters.status } : undefined,
        birth_date: birthDateRange(filters.minAge, filters.maxAge),
      },
      orderBy: [{ entry_date: 'desc' }, { id_animal: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toAnimal);
  }

  async create(data: CreateAnimal): Promise<Animal> {
    // entry_date is server-set, as it was before, so an animal always enters
    // the shelter "today".
    const entry_date = todayUtc();
    const birth_date = data.birth_date ? toDateOnly(data.birth_date) : null;
    assertBirthBeforeEntry(birth_date, entry_date);

    const row = await this.prisma.animal.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed ?? null,
        status: data.status || 'available',
        entry_date,
        weight: data.weight ?? null,
        birth_date,
      },
    });
    return toAnimal(row);
  }

  async update(id: number, data: Partial<CreateAnimal>): Promise<Animal> {
    const existing = await this.prisma.animal.findUnique({
      where: { id_animal: id },
    });
    if (!existing)
      throw new NotFoundException(`Animal with ID ${id} not found`);

    const birth_date =
      data.birth_date !== undefined
        ? toDateOnly(data.birth_date)
        : existing.birth_date;
    // The DB CHECK used to catch this; Zod only compares birth_date to today,
    // so a PATCH could previously push birth_date past entry_date unchecked.
    assertBirthBeforeEntry(birth_date, existing.entry_date);

    const row = await this.prisma.animal.update({
      where: { id_animal: id },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        status: data.status,
        weight: data.weight,
        birth_date: data.birth_date !== undefined ? birth_date : undefined,
      },
    });
    return toAnimal(row);
  }

  async delete(id: number): Promise<boolean> {
    await this.findById(id);
    await this.prisma.animal.delete({ where: { id_animal: id } });
    return true;
  }

  async countByStatus(status: string): Promise<number> {
    return this.prisma.animal.count({ where: { status } });
  }

  /** Per-species available/adopted tallies, previously a GROUP BY with FILTERs. */
  async getStats(): Promise<
    Array<{ species: string; available: number; adopted: number }>
  > {
    const grouped = await this.prisma.animal.groupBy({
      by: ['species', 'status'],
      _count: { _all: true },
    });

    const bySpecies = new Map<
      string,
      { species: string; available: number; adopted: number }
    >();
    for (const row of grouped) {
      const entry = bySpecies.get(row.species) ?? {
        species: row.species,
        available: 0,
        adopted: 0,
      };
      if (row.status === 'available') entry.available += row._count._all;
      if (row.status === 'adopted') entry.adopted += row._count._all;
      bySpecies.set(row.species, entry);
    }

    return [...bySpecies.values()].sort((a, b) =>
      a.species.localeCompare(b.species),
    );
  }
}

/**
 * `EXTRACT(YEAR FROM AGE(birth_date))` bounds expressed as birth-date bounds.
 *
 * An animal is at least `minAge` once its birth date is on or before the day it
 * turned `minAge`; it is at most `maxAge` while its birth date is strictly after
 * the day it would turn `maxAge + 1`.
 */
function birthDateRange(
  minAge?: number,
  maxAge?: number,
): Prisma.DateTimeNullableFilter | undefined {
  if (minAge === undefined && maxAge === undefined) return undefined;
  return {
    ...(minAge !== undefined && { lte: subYears(minAge) }),
    ...(maxAge !== undefined && { gt: subYears(maxAge + 1) }),
  };
}

function assertBirthBeforeEntry(
  birth_date: Date | null,
  entry_date: Date,
): void {
  if (birth_date && birth_date > entry_date) {
    throw new BadRequestException('Birth date cannot be after entry date');
  }
}

function toAnimal(row: AnimalRow): Animal {
  return {
    id: row.id_animal,
    name: row.name,
    species: row.species,
    status: row.status as AnimalStatus,
    entry_date: row.entry_date,
    breed: row.breed ?? null,
    birth_date: row.birth_date ?? null,
    age: completedYears(row.birth_date) ?? null,
    weight: num(row.weight) ?? null,
  };
}
