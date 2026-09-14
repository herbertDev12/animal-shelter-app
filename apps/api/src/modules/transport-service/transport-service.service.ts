import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  ContractCategory,
  ContractStatus,
  CreateTransportService,
  SearchTransportServicesFilters,
  TransportService,
  UpdateTransportService,
} from '@repo/schemas';
import { toDateOnly } from '../../common/prisma-scalars';
import { autoExpire } from '../contract/contract-status';
import { PrismaService } from '../prisma/prisma.service';

/**
 * A transport service is the 1:1 subtype of a contract: it shares the contract's
 * primary key, so reads join both tables and writes touch both.
 */
const withContract = {
  contract: true,
} satisfies Prisma.TransportServiceInclude;

type TransportServiceRow = Prisma.TransportServiceGetPayload<{
  include: typeof withContract;
}>;

@Injectable()
export class TransportServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TransportService[]> {
    const rows = await this.prisma.transportService.findMany({
      include: withContract,
      orderBy: [{ contract: { start_date: 'desc' } }, { id_contract: 'asc' }],
    });
    return rows.map(toTransportService);
  }

  async findById(id: string): Promise<TransportService> {
    const row = await this.prisma.transportService.findUnique({
      where: { id_contract: id },
      include: withContract,
    });
    if (!row) {
      throw new NotFoundException(`Transport service with ID ${id} not found`);
    }
    return toTransportService(row);
  }

  async search(
    filters: SearchTransportServicesFilters,
  ): Promise<TransportService[]> {
    const contractFilter: Prisma.ContractWhereInput = {
      ...(filters.id_supplier && { id_supplier: filters.id_supplier }),
      ...(filters.status && { status: filters.status }),
    };

    const rows = await this.prisma.transportService.findMany({
      where: {
        vehicle: filters.vehicle,
        transport_modality: filters.transport_modality,
        ...(Object.keys(contractFilter).length && {
          contract: { is: contractFilter },
        }),
      },
      include: withContract,
      orderBy: [{ contract: { start_date: 'desc' } }, { id_contract: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toTransportService);
  }

  async create(data: CreateTransportService): Promise<TransportService> {
    const start_date = toDateOnly(data.start_date);
    const end_date = toDateOnly(data.end_date);
    assertDateOrder(start_date, end_date);

    // Nested create: the contract and its transport row land atomically,
    // replacing the hand-rolled BEGIN/COMMIT.
    const contract = await this.prisma.contract.create({
      data: {
        id_supplier: data.id_supplier,
        contract_category: ContractCategory.Service,
        start_date,
        end_date,
        reconciliation_date: data.reconciliation_date
          ? toDateOnly(data.reconciliation_date)
          : null,
        description: data.description ?? null,
        status: autoExpire({
          end_date,
          status: data.status ?? ContractStatus.Active,
        }),
        transport_service: {
          create: {
            vehicle: data.vehicle,
            transport_modality: data.transport_modality,
          },
        },
      },
      select: { id_contract: true },
    });
    return this.findById(contract.id_contract);
  }

  async update(
    id: string,
    data: UpdateTransportService,
  ): Promise<TransportService> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportService.findUnique({
        where: { id_contract: id },
        include: withContract,
      });
      if (!existing) {
        throw new NotFoundException(
          `Transport service with ID ${id} not found`,
        );
      }

      // Expiry and date ordering are evaluated on the merged row, as the
      // trigger did.
      const start_date = data.start_date
        ? toDateOnly(data.start_date)
        : existing.contract.start_date;
      const end_date = data.end_date
        ? toDateOnly(data.end_date)
        : existing.contract.end_date;
      assertDateOrder(start_date, end_date);

      await tx.contract.update({
        where: { id_contract: id },
        data: {
          id_supplier: data.id_supplier,
          start_date: data.start_date ? start_date : undefined,
          end_date: data.end_date ? end_date : undefined,
          reconciliation_date:
            data.reconciliation_date === undefined
              ? undefined
              : data.reconciliation_date === null
                ? null
                : toDateOnly(data.reconciliation_date),
          description: data.description,
          status: autoExpire({
            end_date,
            status: data.status ?? existing.contract.status,
          }),
        },
      });

      await tx.transportService.update({
        where: { id_contract: id },
        data: {
          vehicle: data.vehicle,
          transport_modality: data.transport_modality,
        },
      });
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportService.findUnique({
        where: { id_contract: id },
      });
      if (!existing) {
        throw new NotFoundException(
          `Transport service with ID ${id} not found`,
        );
      }
      // Child first — the contract row is the parent of the shared key.
      await tx.transportService.delete({ where: { id_contract: id } });
      await tx.contract.delete({ where: { id_contract: id } });
      return true;
    });
  }
}

function assertDateOrder(start_date: Date, end_date: Date): void {
  if (end_date < start_date) {
    throw new BadRequestException(
      'End date must be greater than or equal to start date',
    );
  }
}

function toTransportService(row: TransportServiceRow): TransportService {
  return {
    id: row.id_contract,
    id_supplier: row.contract.id_supplier,
    contract_category: ContractCategory.Service,
    start_date: row.contract.start_date,
    end_date: row.contract.end_date,
    reconciliation_date: row.contract.reconciliation_date,
    description: row.contract.description,
    status: row.contract.status as ContractStatus,
    vehicle: row.vehicle as string,
    transport_modality: row.transport_modality as string,
  };
}
