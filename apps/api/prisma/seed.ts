import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Development seed data.
 *
 * Unlike the SQL seed this replaces, nothing here sets an explicit primary key.
 * The old file did, which left every SERIAL sequence parked at 1 and required a
 * separate `setval` script to stop the next INSERT colliding; letting the
 * sequences allocate normally removes that whole class of problem.
 *
 * Re-runnable: it clears the tables in foreign-key order first.
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

async function main(): Promise<void> {
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
      type: 'Veterinarian',
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
            contract_category: 'Veterinarian',
            start_date: date('2026-01-01'),
            end_date: date('2026-12-31'),
            reconciliation_date: date('2026-01-15'),
            description: 'Annual veterinary supplies contract',
            status: 'Active',
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
            contract_category: 'Veterinarian',
            start_date: date('2024-01-01'),
            end_date: date('2024-12-31'),
            reconciliation_date: date('2024-06-30'),
            description: 'Previous year veterinary contract',
            status: 'Expired',
          },
        ],
      },
    },
    include: {
      contracts: {
        include: { services: true },
        orderBy: { id_contract: 'asc' },
      },
    },
  });

  // ------------------------------------------------------- food supplier
  const foodSupplier = await prisma.supplier.create({
    data: {
      name: 'PetFood Premium',
      address: 'La Uruca, San Jose',
      type: 'Food Company',
      phone: '+506 2244 5555',
      contact_email: 'ventas@petfood.cr',
      contact_name: 'Ana Rodriguez',
      province: 'San Jose',
      contracts: {
        create: [
          {
            contract_category: 'Food',
            start_date: date('2026-03-01'),
            end_date: date('2026-12-31'),
            description: 'Premium dog and cat food supply',
            status: 'Active',
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
            contract_category: 'Food',
            start_date: date('2026-01-01'),
            end_date: date('2027-12-31'),
            reconciliation_date: date('2026-04-10'),
            description: 'Premium food supply - reconciled',
            status: 'Active',
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
        orderBy: { id_contract: 'asc' },
      },
    },
  });

  // ----------------------------------------- transport supplier + contract
  const transportSupplier = await prisma.supplier.create({
    data: {
      name: 'TransPet Costa Rica',
      address: 'Cartago centro',
      type: 'Service Company',
      phone: '+506 2555 6666',
      contact_email: 'info@transpet.cr',
      contact_name: 'Luis Hernandez',
      province: 'Cartago',
      contracts: {
        create: [
          {
            contract_category: 'Service',
            start_date: date('2026-06-01'),
            end_date: date('2027-05-31'),
            description: 'Animal transport for vet appointments',
            status: 'Active',
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
        orderBy: { id_contract: 'asc' },
      },
    },
  });

  // -------------------------------- mobile-vet supplier (also a veterinarian)
  await prisma.supplier.create({
    data: {
      name: 'VetMovil CR',
      address: 'Limón centro',
      type: 'Veterinarian',
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
            contract_category: 'Service',
            start_date: date('2026-01-01'),
            end_date: date('2027-12-31'),
            reconciliation_date: date('2026-03-15'),
            description: 'Mobile vet transport - reconciled',
            status: 'Active',
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
      'available',
    ],
    ['Luna', 'Cat', 'Siamese', '2023-02-20', '4.20', '2025-03-01', 'available'],
    [
      'Rocky',
      'Dog',
      'German Shepherd',
      '2021-11-05',
      '38.00',
      '2024-11-20',
      'adopted',
    ],
    ['Nala', 'Cat', 'Persian', '2024-01-10', '3.80', '2025-06-10', 'available'],
    ['Toby', 'Dog', 'Beagle', '2023-07-15', '12.30', '2025-04-22', 'available'],
    [
      'Milo',
      'Rabbit',
      'Holland Lop',
      '2024-03-01',
      '1.50',
      '2025-07-05',
      'available',
    ],
    ['Bella', 'Dog', 'Poodle', '2022-09-18', '6.70', '2025-02-14', 'adopted'],
    [
      'Simba',
      'Cat',
      'Maine Coon',
      '2023-12-25',
      '6.10',
      '2025-05-30',
      'deceased',
    ],
  ] as const;

  const animals: Record<string, number> = {};
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
