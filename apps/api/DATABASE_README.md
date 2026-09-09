# Database Guide (Prisma ORM)

Database access in this API is handled by **Prisma ORM**. `prisma/schema.prisma` is the single source of truth for the schema, changes ship as versioned migrations, and the services query the database directly through a generated, fully typed client — there is no repository layer.

## 📁 Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma        # The schema: models, relations, indexes
│   ├── migrations/          # Versioned, reviewable SQL migrations
│   └── seed.ts              # Typed development seed data
└── src/
    ├── common/
    │   ├── prisma-scalars.ts          # Decimal / Date / Time conversions
    │   └── prisma-exception.filter.ts # Prisma error codes → HTTP responses
    └── modules/
        ├── prisma/
        │   ├── prisma.module.ts   # @Global() module
        │   ├── prisma.service.ts  # PrismaClient + lifecycle hooks
        │   └── database-url.ts    # Connection string construction
        └── <domain>/
            ├── <domain>.module.ts
            ├── <domain>.controller.ts
            └── <domain>.service.ts    # Queries live here
```

## 🔧 Setup

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d db
```

### 2. Environment variables

The root `.env` holds:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=animal_shelter_db
DB_PORT=5434

# Read by the Prisma CLI. The running app can also derive this from the DB_* vars.
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/animal_shelter_db?schema=public
```

`DATABASE_URL` is required by the Prisma CLI, which does not boot the Nest application and therefore cannot compose the URL itself. At runtime `buildDatabaseUrl()` prefers `DATABASE_URL` and otherwise falls back to the individual `DB_*` variables, so the two can never disagree.

### 3. Apply the schema and seed

```bash
pnpm --filter api run prisma:deploy   # apply migrations
pnpm --filter api run db:seed         # load development data
```

## 📜 Commands

All commands run from `apps/api` and read the root `.env` through `dotenv-cli`.

| Command | What it does |
|---------|--------------|
| `pnpm --filter api run prisma:migrate` | Create and apply a migration (development) |
| `pnpm --filter api run prisma:deploy` | Apply pending migrations (CI / production) |
| `pnpm --filter api run prisma:generate` | Regenerate the typed client |
| `pnpm --filter api run db:seed` | Load the development seed data |
| `pnpm --filter api run db:reset` | Drop, re-migrate and re-seed |
| `pnpm --filter api run prisma:studio` | Browse the data in Prisma Studio |

`prisma generate` also runs automatically on `postinstall`, so a fresh `pnpm install` always produces a client.

## 🗄️ The schema

`prisma/schema.prisma` models the existing PostgreSQL tables exactly as they are. `@@map` / `@map` preserve the PascalCase table names and snake_case columns, so the database is never renamed:

```prisma
model Animal {
  id_animal  Int       @id @default(autoincrement())
  name       String    @db.VarChar(100)
  birth_date DateTime? @db.Date
  weight     Decimal?  @db.Decimal(6, 2)
  entry_date DateTime  @db.Date
  status     String?   @default("available") @db.VarChar(20)

  activities Activity[]
  adoptions  Adoption[]
  donations  Donation[]

  @@index([species], map: "idx_animals_species")
  @@map("Animal")
}
```

Two models are **1:1 subtypes** whose primary key is also their foreign key: `Veterinarian` extends `Supplier`, and `TransportService` extends `Contract`.

### Constraints Prisma cannot express

`CHECK` constraints have no representation in the Prisma schema language, so they are appended by hand to the initial migration's `migration.sql`:

- the allowed value sets for `Supplier.type`, `Contract.contract_category`, `Contract.status` and `Animal.status`
- `ServiceOffered.base_price >= 0` and `surcharge >= 0`
- `Contract.end_date >= start_date`
- `Animal.birth_date <= entry_date`

Because Prisma cannot see them, `migrate dev` will never try to drop them. They are also enforced by the Zod schemas in `@repo/schemas`, and — where a `PATCH` can bypass Zod by sending only one side of a comparison — re-checked in the service against the merged row.

## 🧑‍💻 Writing a query

Inject `PrismaService` and query directly. `PrismaModule` is `@Global()`, so nothing needs importing:

```typescript
@Injectable()
export class AnimalService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Animal> {
    const row = await this.prisma.animal.findUnique({ where: { id_animal: id } });
    if (!row) throw new NotFoundException(`Animal with ID ${id} not found`);
    return toAnimal(row);
  }

  async search(filters: SearchAnimalsFilters): Promise<Animal[]> {
    const rows = await this.prisma.animal.findMany({
      where: {
        species: filters.species,
        breed: filters.breed ? { contains: filters.breed, mode: 'insensitive' } : undefined,
        status: filters.status?.length ? { in: filters.status } : undefined,
      },
      orderBy: [{ entry_date: 'desc' }, { id_animal: 'asc' }],
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toAnimal);
  }
}
```

### Transactions

Use `prisma.$transaction()` when several tables must move together, or a nested write when the rows are related — a nested write is atomic by construction:

```typescript
// Supplier + its Veterinarian subtype row, in one statement
await this.prisma.supplier.create({
  data: { name, type: 'Veterinarian', veterinarian: { create: { id_clinic, specialty } } },
});

// Two independent updates that must both land
await this.prisma.$transaction(async (tx) => {
  await tx.supplier.update({ where: { id_supplier: id }, data: { name } });
  await tx.veterinarian.update({ where: { id_supplier: id }, data: { specialty } });
});
```

### Scalar conversions

Prisma's runtime types do not match what the API returns on the wire, so every conversion lives in one place, `src/common/prisma-scalars.ts`:

| Helper | Purpose |
|--------|---------|
| `num` / `numOr0` | `Decimal` → `number` |
| `sumPrice` | `base_price + surcharge`, summed as `Decimal` so money does not drift |
| `toDateOnly` | Normalize an inbound date to UTC midnight before writing a `@db.Date` |
| `dateToString` / `timeToString` | `Date` → `"YYYY-MM-DD"` / `"HH:MM:SS"` for the schemas that declare strings |
| `completedYears` / `subYears` | The `EXTRACT(YEAR FROM AGE(...))` age arithmetic, and its inverse for age filters |
| `daysBetween` | Postgres' `(date - date)::int` day count |

## ⚠️ Errors

`PrismaExceptionFilter` maps Prisma error codes to HTTP responses:

| Code | Response |
|------|----------|
| `P2025` — record not found | `404 Not Found` |
| `P2002` — unique constraint | `409 Conflict` |
| `P2003` — foreign key constraint | `400 Bad Request` |
| `P2010` / `P2011` — raw DB error, incl. `CHECK` violations | `400 Bad Request` |
| anything else | logged, `500 Internal Server Error` |

Because `update` and `delete` raise `P2025` when the row is gone, "missing record" is a `404` without a separate existence check.

## 🧪 Tests

The e2e suite runs against the **live development database** and mutates real rows. Restore known data afterwards with:

```bash
pnpm --filter api run db:reset && pnpm --filter api run db:seed
```
