import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Contract as ContractRow } from '@prisma/client';
import {
  Contract,
  ContractCategory,
  ContractStatus,
  CreateContract,
  SearchContractsFilters,
  UpdateContract,
} from '@repo/schemas';
import { toDateOnly, todayUtc } from '../../common/prisma-scalars';
import { PrismaService } from '../prisma/prisma.service';
import { autoExpire } from './contract-status';

/** How long a sweep is considered fresh, so reads don't re-run it per request. */
const EXPIRY_SWEEP_TTL_MS = 60_000;

@Injectable()
export class ContractService {
  private lastExpirySweep = 0;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Flips overdue contracts to Expired.
   *
   * The `trg_auto_expire_contract` trigger did this on every write, so a
   * contract only expired if something happened to touch it. With the trigger
   * gone the stored column is kept honest here instead — as a stored value, not
   * a derived one, so that `search({ status: ContractStatus.Active })`, which filters on the
   * column, agrees with what callers are shown.
   */
  async expireOverdue(): Promise<void> {
    const now = Date.now();
    if (now - this.lastExpirySweep < EXPIRY_SWEEP_TTL_MS) return;
    this.lastExpirySweep = now;

    await this.prisma.contract.updateMany({
      where: { status: ContractStatus.Active, end_date: { lt: todayUtc() } },
      data: { status: ContractStatus.Expired },
    });
  }

  async findAll(): Promise<Contract[]> {
    await this.expireOverdue();
    const rows = await this.prisma.contract.findMany({
      orderBy: [{ start_date: 'desc' }, { id_contract: 'asc' }],
    });
    return rows.map(toContract);
  }

  async findById(id: string): Promise<Contract> {
    await this.expireOverdue();
    const row = await this.prisma.contract.findUnique({
      where: { id_contract: id },
    });
    if (!row) throw new NotFoundException(`Contract with ID ${id} not found`);
    return toContract(row);
  }

  async search(filters: SearchContractsFilters): Promise<Contract[]> {
    await this.expireOverdue();
    const rows = await this.prisma.contract.findMany({
      where: {
        id_supplier: filters.id_supplier,
        contract_category: filters.contract_category,
        status: filters.status,
      },
      orderBy: [{ start_date: 'desc' }, { id_contract: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toContract);
  }

  async create(data: CreateContract): Promise<Contract> {
    const start_date = toDateOnly(data.start_date);
    const end_date = toDateOnly(data.end_date);
    assertDateOrder(start_date, end_date);

    const row = await this.prisma.contract.create({
      data: {
        id_supplier: data.id_supplier,
        contract_category: data.contract_category,
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
      },
    });
    return toContract(row);
  }

  async update(id: string, data: UpdateContract): Promise<Contract> {
    const existing = await this.prisma.contract.findUnique({
      where: { id_contract: id },
    });
    if (!existing) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // The trigger evaluated the row *after* the write, so expiry and the date
    // ordering are both checked against the merged row: a PATCH that only moves
    // end_date into the past must still expire the contract, and one that only
    // sets end_date must still be compared against the stored start_date.
    const start_date = data.start_date
      ? toDateOnly(data.start_date)
      : existing.start_date;
    const end_date = data.end_date
      ? toDateOnly(data.end_date)
      : existing.end_date;
    assertDateOrder(start_date, end_date);

    const row = await this.prisma.contract.update({
      where: { id_contract: id },
      data: {
        id_supplier: data.id_supplier,
        contract_category: data.contract_category,
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
          status: data.status ?? existing.status,
        }),
      },
    });
    return toContract(row);
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await this.prisma.contract.delete({ where: { id_contract: id } });
    return true;
  }
}

function assertDateOrder(start_date: Date, end_date: Date): void {
  if (end_date < start_date) {
    throw new BadRequestException(
      'End date must be greater than or equal to start date',
    );
  }
}

export function toContract(row: ContractRow): Contract {
  return {
    id: row.id_contract,
    id_supplier: row.id_supplier,
    contract_category: row.contract_category as ContractCategory,
    start_date: row.start_date,
    end_date: row.end_date,
    reconciliation_date: row.reconciliation_date ?? null,
    description: row.description ?? null,
    status: row.status as ContractStatus,
  };
}
