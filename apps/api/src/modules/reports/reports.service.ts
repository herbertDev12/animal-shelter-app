import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ActiveVeterinarianFilters,
  ContractCategory,
  ContractStatus,
  SupplierType,
  ActiveVeterinariansResponse,
  AnimalCareScheduleFilters,
  AnimalCareScheduleResponse,
  ComplementaryServiceContractFilters,
  ComplementaryServiceContractsResponse,
  FoodSupplierContractFilters,
  FoodSupplierContractsResponse,
  ReconciledVeterinarianContractFilters,
  ReconciledVeterinarianContractsResponse,
  RevenuePlanFilters,
  RevenuePlanResponse,
} from '@repo/schemas';
import {
  completedYears,
  daysBetween,
  decimalOf,
  num,
  sumPrice,
  timeToString,
  todayUtc,
} from '../../common/prisma-scalars';
import { ContractService } from '../contract/contract.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contracts: ContractService,
  ) {}

  /**
   * Shelter maintenance percentage applied to each animal's activity cost.
   * Configured via the MAINTENANCE_PERCENTAGE env var (defaults to 15).
   */
  private getMaintenancePercentage(): number {
    const pct = Number(process.env.MAINTENANCE_PERCENTAGE ?? 15);
    return Number.isFinite(pct) ? pct : 15;
  }

  /**
   * Reconciled veterinarian contracts.
   *
   * Every join here is to-one, so the contract is the natural driver and the
   * count matches the rows one-for-one.
   */
  async findReconciledVeterinarianContracts(
    filters: ReconciledVeterinarianContractFilters,
  ): Promise<ReconciledVeterinarianContractsResponse> {
    const { limit, offset } = filters;

    const where: Prisma.ContractWhereInput = {
      reconciliation_date: { not: null },
      contract_category: ContractCategory.Veterinarian,
      supplier: { is: { veterinarian: { isNot: null } } },
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.contract.count({ where }),
      this.prisma.contract.findMany({
        where,
        // The original ORDER BY had no tiebreaker, so tied rows could repeat or
        // vanish across pages; the primary key makes paging stable.
        orderBy: [{ reconciliation_date: 'desc' }, { id_contract: 'asc' }],
        take: limit,
        skip: offset,
        select: {
          start_date: true,
          end_date: true,
          reconciliation_date: true,
          description: true,
          supplier: {
            select: {
              name: true,
              veterinarian: {
                select: {
                  specialty: true,
                  clinic: {
                    select: { name: true, province: true, address: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const data = rows.flatMap((row) => {
      const vet = row.supplier.veterinarian;
      if (!vet) return [];
      return [
        {
          veterinarian_name: row.supplier.name,
          clinic_name: vet.clinic.name,
          province: vet.clinic.province,
          address: vet.clinic.address,
          specialty: vet.specialty,
          start_date: row.start_date,
          end_date: row.end_date,
          reconciliation_date: row.reconciliation_date,
          description: row.description,
        },
      ];
    });

    return {
      data,
      total,
      limit,
      offset,
    } as ReconciledVeterinarianContractsResponse;
  }

  /**
   * Food supplier contracts.
   *
   * Contract ⋈ ServiceOffered fans out — one contract with three services was
   * three rows, and COUNT(*) counted service rows. Driving the query from
   * ServiceOffered reproduces both the totals and the fan-out exactly.
   */
  async findFoodSupplierContracts(
    filters: FoodSupplierContractFilters,
  ): Promise<FoodSupplierContractsResponse> {
    const { limit, offset } = filters;

    const where: Prisma.ServiceOfferedWhereInput = {
      contract: {
        is: {
          reconciliation_date: { not: null },
          contract_category: ContractCategory.Food,
        },
      },
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.serviceOffered.count({ where }),
      this.prisma.serviceOffered.findMany({
        where,
        orderBy: [
          { contract: { reconciliation_date: 'desc' } },
          { id_service: 'asc' },
        ],
        take: limit,
        skip: offset,
        select: {
          food_type: true,
          contract: {
            select: {
              start_date: true,
              end_date: true,
              reconciliation_date: true,
              description: true,
              supplier: {
                select: { name: true, province: true, address: true },
              },
            },
          },
        },
      }),
    ]);

    const data = rows.map((row) => ({
      supplier_name: row.contract.supplier.name,
      food_type: row.food_type,
      province: row.contract.supplier.province,
      address: row.contract.supplier.address,
      start_date: row.contract.start_date,
      end_date: row.contract.end_date,
      reconciliation_date: row.contract.reconciliation_date,
      description: row.contract.description,
    }));

    return { data, total, limit, offset } as FoodSupplierContractsResponse;
  }

  /** Complementary service contracts — same fan-out shape as the food report. */
  async findComplementaryServiceContracts(
    filters: ComplementaryServiceContractFilters,
  ): Promise<ComplementaryServiceContractsResponse> {
    const { limit, offset } = filters;

    const where: Prisma.ServiceOfferedWhereInput = {
      contract: {
        is: {
          reconciliation_date: { not: null },
          contract_category: ContractCategory.Service,
        },
      },
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.serviceOffered.count({ where }),
      this.prisma.serviceOffered.findMany({
        where,
        orderBy: [
          { contract: { reconciliation_date: 'desc' } },
          { id_service: 'asc' },
        ],
        take: limit,
        skip: offset,
        select: {
          name: true,
          base_price: true,
          surcharge: true,
          contract: {
            select: {
              start_date: true,
              end_date: true,
              reconciliation_date: true,
              description: true,
              supplier: { select: { province: true } },
            },
          },
        },
      }),
    ]);

    const data = rows.map((row) => ({
      start_date: row.contract.start_date,
      end_date: row.contract.end_date,
      reconciliation_date: row.contract.reconciliation_date,
      description: row.contract.description,
      service_name: row.name,
      cost_per_service: sumPrice(row.base_price, row.surcharge),
      province: row.contract.supplier.province,
    }));

    return {
      data,
      total,
      limit,
      offset,
    } as ComplementaryServiceContractsResponse;
  }

  /**
   * Veterinarians with an active veterinarian contract.
   *
   * The previous SQL counted DISTINCT veterinarians but selected without
   * DISTINCT, so a vet with three active contracts appeared three times in
   * `data` while counting once in `total`. Driving from Veterinarian is
   * naturally distinct, which makes the two agree; duplicate rows no longer
   * appear.
   */
  async findActiveVeterinarians(
    filters: ActiveVeterinarianFilters,
  ): Promise<ActiveVeterinariansResponse> {
    const { limit, offset, clinic_id, province } = filters;

    // This report filters on the stored contract status, so overdue contracts
    // must be settled first now that the trigger is gone.
    await this.contracts.expireOverdue();

    const where: Prisma.VeterinarianWhereInput = {
      supplier: {
        is: {
          type: SupplierType.Veterinarian,
          contracts: {
            some: {
              contract_category: ContractCategory.Veterinarian,
              status: ContractStatus.Active,
            },
          },
        },
      },
      ...(clinic_id && { id_clinic: clinic_id }),
      ...(province && { clinic: { is: { province } } }),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.veterinarian.count({ where }),
      this.prisma.veterinarian.findMany({
        where,
        orderBy: [{ supplier: { name: 'asc' } }, { id_supplier: 'asc' }],
        take: limit,
        skip: offset,
        select: {
          specialty: true,
          fax: true,
          veterinarian_email: true,
          city_distance: true,
          modality: true,
          supplier: {
            select: { name: true, phone: true, contact_email: true },
          },
          clinic: { select: { name: true, province: true } },
        },
      }),
    ]);

    const date = todayUtc();
    const data = rows.map((row) => ({
      date,
      veterinarian_name: row.supplier.name,
      clinic_name: row.clinic.name,
      // The province shown is the clinic's, not the supplier's.
      province: row.clinic.province,
      specialty: row.specialty,
      phone: row.supplier.phone,
      fax: row.fax,
      email: row.veterinarian_email ?? row.supplier.contact_email,
      distance_to_nearest_city: num(row.city_distance),
      modalities: row.modality,
    }));

    return { data, total, limit, offset } as ActiveVeterinariansResponse;
  }

  /**
   * One animal's care schedule.
   *
   * The original query carried four correlated subqueries evaluated per row.
   * Here the per-animal totals are computed once, so the report costs a fixed
   * four queries no matter how large the page is.
   */
  async findAnimalCareSchedule(
    filters: AnimalCareScheduleFilters,
  ): Promise<AnimalCareScheduleResponse> {
    const { limit, offset, id_animal } = filters;

    const animal = await this.prisma.animal.findUnique({
      where: { id_animal },
      select: {
        name: true,
        species: true,
        breed: true,
        birth_date: true,
        weight: true,
        entry_date: true,
      },
    });
    // An unknown animal yields an empty page, as it did before: this is a
    // paginated report, not an entity lookup.
    if (!animal) return { data: [], total: 0, limit, offset };

    const [total, rows, costRows] = await this.prisma.$transaction([
      this.prisma.activity.count({ where: { id_animal } }),
      this.prisma.activity.findMany({
        where: { id_animal },
        orderBy: [
          { date: 'asc' },
          { time: { sort: 'asc', nulls: 'last' } },
          { id_activity: 'asc' },
        ],
        take: limit,
        skip: offset,
        select: {
          date: true,
          time: true,
          description: true,
          service: {
            select: {
              food_type: true,
              base_price: true,
              surcharge: true,
              contract: {
                select: {
                  contract_category: true,
                  supplier: {
                    select: {
                      name: true,
                      veterinarian: { select: { id_supplier: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      // Every activity cost for this animal, reduced below into the four
      // running totals the report shows on each row.
      this.prisma.activity.findMany({
        where: { id_animal },
        select: {
          service: {
            select: {
              base_price: true,
              surcharge: true,
              contract: {
                select: {
                  contract_category: true,
                  transport_service: { select: { id_contract: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    let totalAll = new Prisma.Decimal(0);
    let totalVet = new Prisma.Decimal(0);
    let totalFood = new Prisma.Decimal(0);
    let totalTransport = new Prisma.Decimal(0);

    for (const activity of costRows) {
      const price = decimalOf(activity.service.base_price).plus(
        decimalOf(activity.service.surcharge),
      );
      totalAll = totalAll.plus(price);
      // These buckets deliberately are not a partition: non-transport 'Service'
      // contracts land in none of them, and transport overlaps the total.
      const category = activity.service.contract.contract_category;
      if (category === ContractCategory.Veterinarian)
        totalVet = totalVet.plus(price);
      if (category === ContractCategory.Food) totalFood = totalFood.plus(price);
      if (activity.service.contract.transport_service) {
        totalTransport = totalTransport.plus(price);
      }
    }

    const pct = this.getMaintenancePercentage();
    const totalActivityCost = totalAll.toNumber();
    const age = completedYears(animal.birth_date);
    const daysInShelter = daysBetween(animal.entry_date);

    const data = rows.map((row) => {
      const contract = row.service.contract;
      // The original LEFT JOIN attached a veterinarian name only when the
      // contract was a veterinarian contract AND the supplier actually had a
      // Veterinarian row.
      const assignedVet =
        contract.contract_category === ContractCategory.Veterinarian &&
        contract.supplier.veterinarian
          ? contract.supplier.name
          : null;

      return {
        animal_name: animal.name,
        species: animal.species,
        breed: animal.breed,
        age,
        weight: num(animal.weight),
        days_in_shelter: daysInShelter,
        day: row.date,
        hour: timeToString(row.time),
        activity_description: row.description,
        price: sumPrice(row.service.base_price, row.service.surcharge),
        assigned_veterinarian_name: assignedVet,
        assigned_food_type: row.service.food_type,
        total_veterinary_care_price: totalVet.toNumber(),
        transport_price: totalTransport.toNumber(),
        total_food_price: totalFood.toNumber(),
        total_activity_cost: totalActivityCost,
        maintenance_percentage: pct,
        total_maintenance_cost: totalActivityCost * (1 + pct / 100),
      };
    });

    return { data, total, limit, offset };
  }

  /**
   * Per-animal revenue plan.
   *
   * Costs a fixed five queries per page: the count and the page of animals,
   * then three aggregations scoped to that page's animal ids.
   */
  async findRevenuePlan(
    filters: RevenuePlanFilters,
  ): Promise<RevenuePlanResponse> {
    const { limit, offset } = filters;

    const [total, animals] = await this.prisma.$transaction([
      this.prisma.animal.count(),
      this.prisma.animal.findMany({
        orderBy: [{ name: 'asc' }, { id_animal: 'asc' }],
        take: limit,
        skip: offset,
        select: {
          id_animal: true,
          name: true,
          species: true,
          breed: true,
          birth_date: true,
        },
      }),
    ]);

    const ids = animals.map((a) => a.id_animal);

    const [adoptions, donations, activityCosts] = await Promise.all([
      this.prisma.adoption.groupBy({
        by: ['id_animal'],
        where: { id_animal: { in: ids } },
        _sum: { adoption_price: true },
      }),
      this.prisma.donation.groupBy({
        by: ['id_animal'],
        where: { id_animal: { in: ids } },
        _sum: { amount: true },
      }),
      // groupBy cannot reach across the relation to ServiceOffered's prices,
      // so the pairs are fetched once and summed here.
      this.prisma.activity.findMany({
        where: { id_animal: { in: ids } },
        select: {
          id_animal: true,
          service: { select: { base_price: true, surcharge: true } },
        },
      }),
    ]);

    const adoptionByAnimal = new Map(
      adoptions.map((row) => [
        row.id_animal,
        num(row._sum.adoption_price) ?? 0,
      ]),
    );
    const donationByAnimal = new Map(
      donations.map((row) => [row.id_animal, num(row._sum.amount) ?? 0]),
    );
    const costByAnimal = new Map<string, Prisma.Decimal>();
    for (const activity of activityCosts) {
      const price = decimalOf(activity.service.base_price).plus(
        decimalOf(activity.service.surcharge),
      );
      costByAnimal.set(
        activity.id_animal,
        (costByAnimal.get(activity.id_animal) ?? new Prisma.Decimal(0)).plus(
          price,
        ),
      );
    }

    const pct = this.getMaintenancePercentage();
    const data = animals.map((animal) => {
      const cost = (
        costByAnimal.get(animal.id_animal) ?? new Prisma.Decimal(0)
      ).toNumber();
      // groupBy returns no row for an animal with no adoptions or donations,
      // which is where the COALESCE(..., 0) went.
      const fee = adoptionByAnimal.get(animal.id_animal) ?? 0;
      const donated = donationByAnimal.get(animal.id_animal) ?? 0;

      return {
        animal_name: animal.name,
        species: animal.species,
        breed: animal.breed,
        age: completedYears(animal.birth_date),
        total_activity_cost: cost,
        total_adoption_fee: fee,
        total_donations: donated,
        // Revenue is gross: maintenance is reported alongside, not subtracted.
        total_revenue: fee + donated,
        total_maintenance_cost: cost * (1 + pct / 100),
      };
    });

    return { data, total, limit, offset };
  }
}
