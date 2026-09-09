import { Injectable, NotFoundException } from '@nestjs/common';
import type { ServiceOffered as ServiceOfferedRow } from '@prisma/client';
import {
  CreateServiceOffered,
  SearchServiceOfferedFilters,
  ServiceOffered,
  UpdateServiceOffered,
} from '@repo/schemas';
import { numOr0 } from '../../common/prisma-scalars';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceOfferedService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ServiceOffered[]> {
    const rows = await this.prisma.serviceOffered.findMany({
      orderBy: { id_service: 'asc' },
    });
    return rows.map(toServiceOffered);
  }

  async findById(id: number): Promise<ServiceOffered> {
    const row = await this.prisma.serviceOffered.findUnique({
      where: { id_service: id },
    });
    if (!row) {
      throw new NotFoundException(`ServiceOffered with ID ${id} not found`);
    }
    return toServiceOffered(row);
  }

  async search(
    filters: SearchServiceOfferedFilters,
  ): Promise<ServiceOffered[]> {
    const rows = await this.prisma.serviceOffered.findMany({
      where: {
        id_contract: filters.id_contract,
        food_type: filters.food_type,
      },
      orderBy: { id_service: 'asc' },
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toServiceOffered);
  }

  async create(data: CreateServiceOffered): Promise<ServiceOffered> {
    const row = await this.prisma.serviceOffered.create({
      data: {
        id_contract: data.id_contract,
        name: data.name,
        food_type: data.food_type ?? null,
        base_price: data.base_price,
        surcharge: data.surcharge ?? 0,
      },
    });
    return toServiceOffered(row);
  }

  async update(
    id: number,
    data: UpdateServiceOffered,
  ): Promise<ServiceOffered> {
    await this.findById(id);
    const row = await this.prisma.serviceOffered.update({
      where: { id_service: id },
      data: {
        id_contract: data.id_contract,
        name: data.name,
        food_type: data.food_type,
        base_price: data.base_price,
        surcharge: data.surcharge,
      },
    });
    return toServiceOffered(row);
  }

  async remove(id: number): Promise<boolean> {
    await this.findById(id);
    await this.prisma.serviceOffered.delete({ where: { id_service: id } });
    return true;
  }
}

function toServiceOffered(row: ServiceOfferedRow): ServiceOffered {
  return {
    id: row.id_service,
    id_contract: row.id_contract,
    name: row.name,
    food_type: row.food_type,
    base_price: numOr0(row.base_price),
    surcharge: numOr0(row.surcharge),
  };
}
