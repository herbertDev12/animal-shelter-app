import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  Activity,
  CreateActivity,
  SearchActivityFilters,
  UpdateActivity,
} from '@repo/schemas';
import {
  dateToString,
  timeToString,
  toDateOnly,
  toTimeOnly,
} from '../../common/prisma-scalars';
import { autoExpire } from '../contract/contract-status';
import { PrismaService } from '../prisma/prisma.service';

/** The joined shape every read path returns. */
const withNames = {
  animal: { select: { name: true } },
  service: { select: { name: true } },
} satisfies Prisma.ActivityInclude;

type ActivityWithNames = Prisma.ActivityGetPayload<{
  include: typeof withNames;
}>;

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Activity[]> {
    const rows = await this.prisma.activity.findMany({
      include: withNames,
      orderBy: [{ date: 'desc' }, { time: 'desc' }, { id_activity: 'asc' }],
    });
    return rows.map(toActivity);
  }

  async findById(id: number): Promise<Activity> {
    const row = await this.prisma.activity.findUnique({
      where: { id_activity: id },
      include: withNames,
    });
    if (!row) throw new NotFoundException(`Activity with ID ${id} not found`);
    return toActivity(row);
  }

  async search(filters: SearchActivityFilters): Promise<Activity[]> {
    const rows = await this.prisma.activity.findMany({
      where: {
        id_animal: filters.id_animal,
        id_service: filters.id_service,
        date: dateRange(filters.date_from, filters.date_to),
      },
      include: withNames,
      orderBy: [{ date: 'desc' }, { time: 'desc' }, { id_activity: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toActivity);
  }

  async create(data: CreateActivity): Promise<Activity> {
    // Written in one transaction so the contract cannot be deactivated between
    // the check and the insert. (Not proof against a concurrent deactivation
    // under a weaker isolation level, but it closes the in-request gap the
    // `trg_validate_contract_active` trigger used to cover.)
    const row = await this.prisma.$transaction(async (tx) => {
      await assertContractActive(tx, data.id_service);
      return tx.activity.create({
        data: {
          id_animal: data.id_animal,
          id_service: data.id_service,
          description: data.description ?? null,
          date: toDateOnly(data.date),
          time: toTimeOnly(data.time ?? null),
        },
        include: withNames,
      });
    });
    return toActivity(row);
  }

  async update(id: number, data: UpdateActivity): Promise<Activity> {
    const row = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.activity.findUnique({
        where: { id_activity: id },
      });
      if (!existing) {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }

      // The trigger revalidated on every UPDATE against the effective service,
      // not just when the service changed. Matching that means editing, say, a
      // description on an activity whose contract has since gone inactive is
      // now rejected by the service too.
      await assertContractActive(tx, data.id_service ?? existing.id_service);

      return tx.activity.update({
        where: { id_activity: id },
        data: {
          id_animal: data.id_animal,
          id_service: data.id_service,
          description: data.description,
          date: data.date ? toDateOnly(data.date) : undefined,
          time:
            data.time === undefined ? undefined : toTimeOnly(data.time ?? null),
        },
        include: withNames,
      });
    });
    return toActivity(row);
  }

  async delete(id: number): Promise<boolean> {
    await this.findById(id);
    await this.prisma.activity.delete({ where: { id_activity: id } });
    return true;
  }
}

/**
 * Replaces the `fn_validate_contract_active` trigger: an activity may only
 * reference a service whose contract exists and is currently active. Overdue
 * contracts count as expired here even if the stored column has not caught up.
 */
async function assertContractActive(
  tx: Prisma.TransactionClient,
  id_service: number,
): Promise<void> {
  const service = await tx.serviceOffered.findUnique({
    where: { id_service },
    select: {
      id_contract: true,
      contract: { select: { status: true, end_date: true } },
    },
  });

  if (!service) {
    throw new BadRequestException(
      `Service ${id_service} does not exist or has no contract`,
    );
  }

  const status = autoExpire(service.contract);
  if (status !== 'Active') {
    throw new BadRequestException(
      `Contract ${service.id_contract} is not active (status: ${status})`,
    );
  }
}

function dateRange(from?: string, to?: string) {
  if (!from && !to) return undefined;
  return {
    ...(from && { gte: toDateOnly(from) }),
    ...(to && { lte: toDateOnly(to) }),
  };
}

function toActivity(row: ActivityWithNames): Activity {
  return {
    id_activity: row.id_activity,
    id_animal: row.id_animal,
    animal_name: row.animal?.name ?? null,
    id_service: row.id_service,
    service_name: row.service?.name ?? null,
    description: row.description,
    // The schema declares these as strings; node-postgres used to hand back a
    // Date for `date`, which serialized as a full timestamp.
    date: dateToString(row.date) as string,
    time: timeToString(row.time),
  };
}
