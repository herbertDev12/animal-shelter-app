import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Prisma,
  ServiceOffered as ServiceOfferedRow,
} from '@prisma/client';
import {
  ContractCategory,
  CreateServiceOffered,
  SearchServiceOfferedFilters,
  ServiceOffered,
  ServiceOfferedListItem,
  UpdateServiceOffered,
} from '@repo/schemas';
import { numOr0 } from '../../common/prisma-scalars';
import { contractLabel } from '../contract/contract-label';
import { PrismaService } from '../prisma/prisma.service';

/** List responses label the contract instead of exposing its id. */
const withContractLabel = {
  contract: {
    select: { contract_category: true, supplier: { select: { name: true } } },
  },
} satisfies Prisma.ServiceOfferedInclude;

type ServiceOfferedWithContractLabel = Prisma.ServiceOfferedGetPayload<{
  include: typeof withContractLabel;
}>;

@Injectable()
export class ServiceOfferedService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ServiceOfferedListItem[]> {
    const rows = await this.prisma.serviceOffered.findMany({
      include: withContractLabel,
      orderBy: { id_service: 'asc' },
    });
    return rows.map(toServiceOfferedListItem);
  }

  async findById(id: string): Promise<ServiceOffered> {
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
  ): Promise<ServiceOfferedListItem[]> {
    const rows = await this.prisma.serviceOffered.findMany({
      where: {
        id_contract: filters.id_contract,
        food_type: filters.food_type,
      },
      include: withContractLabel,
      orderBy: { id_service: 'asc' },
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toServiceOfferedListItem);
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
    id: string,
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

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await this.prisma.serviceOffered.delete({ where: { id_service: id } });
    return true;
  }
}

function serviceOfferedFields(row: ServiceOfferedRow) {
  return {
    id: row.id_service,
    name: row.name,
    food_type: row.food_type,
    base_price: numOr0(row.base_price),
    surcharge: numOr0(row.surcharge),
  };
}

function toServiceOffered(row: ServiceOfferedRow): ServiceOffered {
  return { ...serviceOfferedFields(row), id_contract: row.id_contract };
}

function toServiceOfferedListItem(
  row: ServiceOfferedWithContractLabel,
): ServiceOfferedListItem {
  return {
    ...serviceOfferedFields(row),
    contract_name: contractLabel(
      row.contract.supplier.name,
      row.contract.contract_category as ContractCategory | null,
    ),
  };
}
