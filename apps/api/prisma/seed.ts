import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  ADMIN_ROLE,
  PERMISSION_CATALOG,
  WORKER_EXCLUDED_MODULES,
  WORKER_ROLE,
} from '../src/modules/auth/permissions';
import {
  AnimalStatus,
  ContractCategory,
  ContractStatus,
  SupplierType,
} from '@repo/schemas';

/**
 * Development seed data.
 *
 * Nothing here sets an explicit primary key: every id is a UUID generated on
 * insert, so rows are looked up by the values returned from `create`.
 *
 * Re-runnable: it clears the shelter tables in foreign-key order first. Access
 * control (permissions, roles, the admin account) is upserted instead, so
 * re-seeding never wipes user accounts.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** A `@db.Date` value — dates are stored at UTC midnight. */
const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
/** A `@db.Time` value — Prisma represents TIME as a Date on the epoch day. */
const time = (hms: string) => new Date(`1970-01-01T${hms}.000Z`);
const money = (value: string) => new Prisma.Decimal(value);

async function clear(): Promise<void> {
  // Leaves first, then roots.
  await prisma.activity.deleteMany();
  await prisma.adoption.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.serviceOffered.deleteMany();
  await prisma.transportService.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.veterinarian.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.clinic.deleteMany();
}

async function seedAccessControl(): Promise<void> {
  const permissions = await Promise.all(
    PERMISSION_CATALOG.map(({ code, name }) =>
      prisma.permission.upsert({
        where: { code },
        update: { name },
        create: { code, name },
      }),
    ),
  );

  const workerPermissions = permissions.filter(
    ({ code }) =>
      !WORKER_EXCLUDED_MODULES.some((module) => code.startsWith(`${module}.`)),
  );
  const grants = [
    { name: ADMIN_ROLE, permissions },
    { name: WORKER_ROLE, permissions: workerPermissions },
  ];

  const roles: Record<string, string> = {};
  for (const grant of grants) {
    const role = await prisma.role.upsert({
      where: { name: grant.name },
      update: { isActive: true, isDeleted: false },
      create: { name: grant.name },
    });
    roles[grant.name] = role.id;

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
      prisma.rolePermission.createMany({
        data: grant.permissions.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
      }),
    ]);
  }

  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@shelter.local')
    .trim()
    .toLowerCase();
  const passwordHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345!',
    10,
  );

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, roleId: roles[ADMIN_ROLE] },
    create: {
      email,
      passwordHash,
      name: 'Admin',
      roleId: roles[ADMIN_ROLE],
    },
  });
}

async function main(): Promise<void> {
  await seedAccessControl();
  await clear();

  // ---------------------------------------------------------------- clinics
  const [vetCare, patitas, guanacaste] = await Promise.all([
    prisma.clinic.create({
      data: {
        name: 'VetCare Central',
        province: 'San Jose',
        address: 'Avenida Central, 125',
      },
    }),
    prisma.clinic.create({
      data: {
        name: 'Patitas Clinic',
        province: 'Alajuela',
        address: 'Calle 3, Bloque B',
      },
    }),
    prisma.clinic.create({
      data: {
        name: 'Animal Hospital Guanacaste',
        province: 'Guanacaste',
        address: 'Libertad, 800',
      },
    }),
  ]);
  void guanacaste;

  // ------------------------------------------- veterinarian supplier + work
  // The veterinarian, its contracts and their services are created in one
  // nested write, so the supplier/veterinarian subtype pair is always complete.
  const vetSupplier = await prisma.supplier.create({
    data: {
      name: 'VetSuministros CR',
      address: 'Zona Industrial, San Jose',
      type: SupplierType.Veterinarian,
      phone: '+506 2222 3333',
      contact_email: 'contacto@vetsuministros.cr',
      contact_name: 'Carlos Mora',
      province: 'San Jose',
      veterinarian: {
        create: {
          clinic: { connect: { id_clinic: vetCare.id_clinic } },
          modality: 'In-person',
          specialty: 'General Surgery',
          fax: '+506 2222 3334',
          veterinarian_email: 'carlos@vetsuministros.cr',
          city_distance: money('5.20'),
        },
      },
      contracts: {
        create: [
          {
            contract_category: ContractCategory.Veterinarian,
            start_date: date('2026-01-01'),
            end_date: date('2026-12-31'),
            reconciliation_date: date('2026-01-15'),
            description: 'Annual veterinary supplies contract',
            status: ContractStatus.Active,
            services: {
              create: [
                {
                  name: 'Consulta General',
                  base_price: money('35.00'),
                  surcharge: money('5.00'),
                },
                {
                  name: 'Vacunación Completa',
                  base_price: money('40.00'),
                  surcharge: money('0.00'),
                },
              ],
            },
          },
          {
            contract_category: ContractCategory.Veterinarian,
            start_date: date('2024-01-01'),
            end_date: date('2024-12-31'),
            reconciliation_date: date('2024-06-30'),
            description: 'Previous year veterinary contract',
            status: ContractStatus.Expired,
          },
        ],
      },
    },
    include: {
      contracts: {
        include: { services: true },
        orderBy: { start_date: 'desc' },
      },
    },
  });

  // ------------------------------------------------------- food supplier
  const foodSupplier = await prisma.supplier.create({
    data: {
      name: 'PetFood Premium',
      address: 'La Uruca, San Jose',
      type: SupplierType.FoodCompany,
      phone: '+506 2244 5555',
      contact_email: 'ventas@petfood.cr',
      contact_name: 'Ana Rodriguez',
      province: 'San Jose',
      contracts: {
        create: [
          {
            contract_category: ContractCategory.Food,
            start_date: date('2026-03-01'),
            end_date: date('2026-12-31'),
            description: 'Premium dog and cat food supply',
            status: ContractStatus.Active,
            services: {
              create: [
                {
                  name: 'Saco de Pienso 20kg',
                  food_type: 'Pienso',
                  base_price: money('42.50'),
                  surcharge: money('0.00'),
                },
                {
                  name: 'Alimento Húmedo Premium',
                  food_type: 'Húmeda',
                  base_price: money('30.00'),
                  surcharge: money('0.00'),
                },
              ],
            },
          },
          {
            contract_category: ContractCategory.Food,
            start_date: date('2026-01-01'),
            end_date: date('2027-12-31'),
            reconciliation_date: date('2026-04-10'),
            description: 'Premium food supply - reconciled',
            status: ContractStatus.Active,
            services: {
              create: [
                {
                  name: 'Saco de Pienso Mensual',
                  food_type: 'Pienso',
                  base_price: money('45.00'),
                  surcharge: money('0.00'),
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      contracts: {
        include: { services: true },
        orderBy: { start_date: 'desc' },
      },
    },
  });

  // ----------------------------------------- transport supplier + contract
  const transportSupplier = await prisma.supplier.create({
    data: {
      name: 'TransPet Costa Rica',
      address: 'Cartago centro',
      type: SupplierType.ServiceCompany,
      phone: '+506 2555 6666',
      contact_email: 'info@transpet.cr',
      contact_name: 'Luis Hernandez',
      province: 'Cartago',
      contracts: {
        create: [
          {
            contract_category: ContractCategory.Service,
            start_date: date('2026-06-01'),
            end_date: date('2027-05-31'),
            description: 'Animal transport for vet appointments',
            status: ContractStatus.Active,
            transport_service: {
              create: {
                vehicle: 'Toyota Hiace Van',
                transport_modality: 'Shared rides, scheduled days',
              },
            },
            services: {
              create: [
                {
                  name: 'Traslado Local',
                  base_price: money('25.00'),
                  surcharge: money('10.00'),
                },
                {
                  name: 'Traslado Interprovincial',
                  base_price: money('50.00'),
                  surcharge: money('15.00'),
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      contracts: {
        include: { services: true },
        orderBy: { start_date: 'desc' },
      },
    },
  });

  // -------------------------------- mobile-vet supplier (also a veterinarian)
  await prisma.supplier.create({
    data: {
      name: 'VetMovil CR',
      address: 'Limón centro',
      type: SupplierType.Veterinarian,
      phone: '+506 2777 8888',
      contact_email: 'servicios@vetmovil.cr',
      contact_name: 'Maria Chen',
      province: 'Limón',
      veterinarian: {
        create: {
          clinic: { connect: { id_clinic: patitas.id_clinic } },
          modality: 'Mobile',
          specialty: 'Exotic Animals',
          fax: '+506 2777 8889',
          veterinarian_email: 'maria@vetmovil.cr',
          city_distance: money('45.00'),
        },
      },
      contracts: {
        create: [
          {
            contract_category: ContractCategory.Service,
            start_date: date('2026-01-01'),
            end_date: date('2027-12-31'),
            reconciliation_date: date('2026-03-15'),
            description: 'Mobile vet transport - reconciled',
            status: ContractStatus.Active,
            transport_service: {
              create: {
                vehicle: 'Nissan NV200',
                transport_modality: 'Door-to-door, on demand',
              },
            },
            services: {
              create: [
                {
                  name: 'Traslado Veterinario Mensual',
                  base_price: money('60.00'),
                  surcharge: money('5.00'),
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------- animals
  const animalData = [
    [
      'Max',
      'Dog',
      'Labrador Retriever',
      '2022-05-10',
      '30.50',
      '2025-01-15',
      AnimalStatus.Available,
    ],
    [
      'Luna',
      'Cat',
      'Siamese',
      '2023-02-20',
      '4.20',
      '2025-03-01',
      AnimalStatus.Available,
    ],
    [
      'Rocky',
      'Dog',
      'German Shepherd',
      '2021-11-05',
      '38.00',
      '2024-11-20',
      AnimalStatus.Adopted,
    ],
    [
      'Nala',
      'Cat',
      'Persian',
      '2024-01-10',
      '3.80',
      '2025-06-10',
      AnimalStatus.Available,
    ],
    [
      'Toby',
      'Dog',
      'Beagle',
      '2023-07-15',
      '12.30',
      '2025-04-22',
      AnimalStatus.Available,
    ],
    [
      'Milo',
      'Rabbit',
      'Holland Lop',
      '2024-03-01',
      '1.50',
      '2025-07-05',
      AnimalStatus.Available,
    ],
    [
      'Bella',
      'Dog',
      'Poodle',
      '2022-09-18',
      '6.70',
      '2025-02-14',
      AnimalStatus.Adopted,
    ],
    [
      'Simba',
      'Cat',
      'Maine Coon',
      '2023-12-25',
      '6.10',
      '2025-05-30',
      AnimalStatus.Deceased,
    ],
  ] as const;

  const animals: Record<string, string> = {};
  for (const [
    name,
    species,
    breed,
    birth,
    weight,
    entry,
    status,
  ] of animalData) {
    const created = await prisma.animal.create({
      data: {
        name,
        species,
        breed,
        birth_date: date(birth),
        weight: money(weight),
        entry_date: date(entry),
        status,
      },
    });
    animals[name] = created.id_animal;
  }

  // -------------------------------------------------------------- activities
  const vetContract = vetSupplier.contracts[0];
  const consulta = vetContract.services.find(
    (s) => s.name === 'Consulta General',
  )!;
  const vacunacion = vetContract.services.find(
    (s) => s.name === 'Vacunación Completa',
  )!;
  const pienso = foodSupplier.contracts[0].services.find(
    (s) => s.name === 'Saco de Pienso 20kg',
  )!;
  const trasladoLocal = transportSupplier.contracts[0].services.find(
    (s) => s.name === 'Traslado Local',
  )!;

  await prisma.activity.createMany({
    data: [
      {
        id_animal: animals.Max,
        id_service: vacunacion.id_service,
        description: 'Annual rabies and distemper vaccination',
        date: date('2026-07-15'),
        time: time('09:00:00'),
      },
      // Luna's feeding plan: one row per day, so the number of rows is the
      // number of days and the cost aggregates naturally.
      ...[10, 11, 12, 13, 14].map((day, index) => ({
        id_animal: animals.Luna,
        id_service: pienso.id_service,
        description: `Daily nutrition plan - senior cat formula (day ${index + 1})`,
        date: date(`2026-07-${day}`),
        time: time('08:00:00'),
      })),
      {
        id_animal: animals.Toby,
        id_service: trasladoLocal.id_service,
        description: 'Transport to VetCare Central for check-up',
        date: date('2026-08-01'),
        time: time('10:30:00'),
      },
      {
        id_animal: animals.Nala,
        id_service: consulta.id_service,
        description: 'Routine health examination',
        date: date('2026-07-20'),
        time: time('14:00:00'),
      },
    ],
  });

  // --------------------------------------------------- adoptions & donations
  await prisma.adoption.createMany({
    data: [
      {
        id_animal: animals.Rocky,
        adoption_date: date('2025-04-10'),
        adoption_price: money('150.00'),
      },
      {
        id_animal: animals.Bella,
        adoption_date: date('2025-06-01'),
        adoption_price: money('120.00'),
      },
    ],
  });

  await prisma.donation.createMany({
    data: [
      {
        id_animal: animals.Max,
        amount: money('50.00'),
        date: date('2025-03-15'),
        donor: 'Maria Gutierrez',
      },
      {
        id_animal: animals.Luna,
        amount: money('200.00'),
        date: date('2025-05-20'),
        donor: 'Pedro Alvarez',
      },
      {
        id_animal: animals.Toby,
        amount: money('75.00'),
        date: date('2025-06-18'),
        donor: 'Fundacion Patitas Felices',
      },
    ],
  });

  console.log('✓ Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
