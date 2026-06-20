# Animal Shelter App 🐾

> 🇬🇧 **English version below.** · 🇪🇸 La **versión en español** está [más abajo](#-versión-en-español).

A full‑stack application for the **end‑to‑end management of an animal shelter**: it manages animals, adoptions, donations, veterinary clinics, suppliers, service contracts, services offered, transport, an activity schedule and analytical reports.

This document (`Readmev2.md`) is a **complete and detailed** explanation of the project, with emphasis on the **API** (patterns, modules and database), the **shared schemas package** and a general overview of the **web frontend** and its libraries.

---

## Table of contents

1. [General architecture (monorepo)](#1-general-architecture-monorepo)
2. [Tech stack](#2-tech-stack)
3. [The API (NestJS) — in depth](#3-the-api-nestjs--in-depth)
   - [Bootstrap and configuration](#31-bootstrap-and-configuration-maints)
   - [Architectural patterns](#32-architectural-patterns)
   - [Anatomy of a module](#33-anatomy-of-a-module)
   - [Data access layer: the `BaseRepository`](#34-data-access-layer-the-baserepository)
   - [Validation with Zod](#35-validation-with-zod)
   - [Error handling](#36-error-handling)
   - [Module catalog](#37-module-catalog)
4. [Database (PostgreSQL)](#4-database-postgresql)
   - [Provisioning with Docker](#41-provisioning-with-docker)
   - [Data model and relationships](#42-data-model-and-relationships)
   - [Initialization scripts](#43-initialization-scripts)
   - [Connection from the API](#44-connection-from-the-api)
5. [The `@repo/schemas` package](#5-the-reposchemas-package)
6. [The web frontend (React + Vite)](#6-the-web-frontend-react--vite)
7. [Auxiliary shared packages](#7-auxiliary-shared-packages)
8. [Getting started](#8-getting-started)

---

## 1. General architecture (monorepo)

The project is a **monorepo** managed with **pnpm workspaces** and orchestrated with **Turborepo**. The root structure is:

```
animal-shelter-app/
├── apps/
│   ├── api/          # NestJS + PostgreSQL backend
│   └── web/          # React + Vite frontend
├── packages/
│   ├── schemas/      # @repo/schemas  → shared Zod schemas + DTOs
│   ├── ui/           # @repo/ui       → UI components (Radix + Tailwind)
│   ├── eslint-config/        # @repo/eslint-config
│   └── typescript-config/    # @repo/typescript-config
├── docker-compose.yml        # PostgreSQL database
├── pnpm-workspace.yaml
├── turbo.json
└── .env
```

`pnpm-workspace.yaml` declares the workspaces and forces a single Zod version across the whole monorepo (`overrides: zod: ^4.1.13`), avoiding version conflicts between the API and the web:

```yaml
packages:
  - "apps/*"
  - "packages/*"
overrides:
  zod: ^4.1.13
```

**Turborepo** (`turbo.json`) defines the `build`, `dev` and `lint` tasks with incremental caching. From the root: `pnpm dev`, `pnpm build`, `pnpm lint`.

**Key advantage of the monorepo:** the `@repo/schemas` package defines the validation schemas and types **once** and they are shared by both the API (to validate requests) and the web (to validate forms and infer types). This provides **end‑to‑end type safety**.

---

## 2. Tech stack

| Layer | Technologies |
|------|-------------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **API** | NestJS 11, Express 5, TypeScript 5.7, `pg` (PostgreSQL), Zod 4 + nestjs-zod |
| **Database** | PostgreSQL 15 (Alpine) on Docker, plain SQL (no ORM) |
| **Schemas** | Zod + nestjs-zod (`createZodDto`) in `@repo/schemas` |
| **Web** | React 19, Vite 5, TanStack Router / Query / Table, React Hook Form, Zod, Tailwind 4, Radix UI, nuqs, Recharts, Sonner, Lucide |
| **Quality** | ESLint, Prettier, Husky, lint-staged, commitlint |

---

## 3. The API (NestJS) — in depth

The API is built with **NestJS 11** on top of **Express 5**, written in TypeScript. It follows a **modular, layered architecture** with no ORM: data access is done with **parameterized plain SQL** through the `pg` driver.

Structure of `apps/api/src`:

```
src/
├── main.ts              # Entry point / server bootstrap
├── app.module.ts        # Root module: imports all domain modules
├── app.controller.ts
├── app.service.ts
└── modules/
    ├── database/        # DB connection + base repository (infrastructure core)
    │   ├── database.module.ts
    │   ├── base.repository.ts
    │   └── config/database.config.ts
    ├── animal/
    ├── adoption/
    ├── activity-schedule/
    ├── clinic/
    ├── contract/
    ├── donation/
    ├── reports/
    ├── service-offered/
    ├── supplier/
    ├── transport-service/
    └── veterinarian/
```

### 3.1. Bootstrap and configuration (`main.ts`)

`main.ts` performs the bootstrap:

```typescript
// Load environment variables BEFORE importing the rest of the modules
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());   // Global validation with Zod
  app.enableCors({
    origin: process.env.WEB_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3002);
}
```

Key points:

- **Port:** `3002`.
- **CORS:** enabled, the allowed origin comes from `WEB_URL` (the web runs on `http://localhost:5173`).
- **Global validation:** a `ZodValidationPipe` from `nestjs-zod` is registered, so that **every** `@Body()`, `@Query()` or `@Param()` typed with a Zod DTO is automatically validated before reaching the controller.
- **Environment variables:** loaded with `dotenv` from both the root `.env` and the `apps/api` one.

The **root module** (`app.module.ts`) simply imports the `DatabaseModule` and the 11 domain modules:

```typescript
@Module({
  imports: [
    DatabaseModule, AnimalsModule, ClinicsModule, SupplierModule,
    ReportsModule, ContractModule, TransportServiceModule, VeterinarianModule,
    ServiceOfferedModule, ActivityScheduleModule, DonationModule, AdoptionModule,
  ],
})
export class AppModule {}
```

### 3.2. Architectural patterns

The API combines several classic NestJS patterns:

1. **Modular feature-based architecture:** each domain entity is an independent, self-contained NestJS module.
2. **Dependency injection (DI):** the NestJS DI container is used with constructor injection.
3. **Layered pattern (Controller → Service → Repository):**
   - **Controller** — defines the REST HTTP routes and delegates to the service.
   - **Service** — contains the business logic and throws domain exceptions (e.g. `NotFoundException`).
   - **Repository** — encapsulates data access (SQL).
4. **Repository Pattern with a base class:** all repositories extend an abstract `BaseRepository` that centralizes query execution, error handling and generic CRUD operations.

The flow of a request is:

```
HTTP → Controller → Service → Repository → (pg.Pool) → PostgreSQL
                       ↑ ZodValidationPipe validates the body/query before the controller
```

### 3.3. Anatomy of a module

Let's take the **`service-offered`** module as a representative example. It contains four files:

**`service-offered.module.ts`** — declares the module, imports `DatabaseModule` (to access the pool), registers the service and the repository as *providers* and exports the service so other modules can reuse it.

**`service-offered.controller.ts`** — defines the REST endpoints:

```typescript
@Controller('services-offered')
export class ServiceOfferedController {
  constructor(private readonly serviceOfferedService: ServiceOfferedService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOfferedService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateServiceOfferedDto) {
    return this.serviceOfferedService.create(data);
  }
}
```

Note the use of `ParseIntPipe` (converts and validates the numeric `:id`) and the DTOs (`CreateServiceOfferedDto`) that trigger the global Zod validation.

**`service-offered.service.ts`** — business logic; translates "not found" into an HTTP exception:

```typescript
@Injectable()
export class ServiceOfferedService {
  constructor(private readonly serviceOfferedRepository: ServiceOfferedRepository) {}

  async findById(id: number): Promise<ServiceOffered> {
    const service = await this.serviceOfferedRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service offered with ID ${id} not found`);
    }
    return service;
  }
}
```

**`service-offered.repository.ts`** — data access; extends `BaseRepository`, writes parameterized SQL and maps the DB rows to domain models.

This **4-files-per-module** pattern (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`) repeats identically across all domain modules, which makes the code very predictable.

### 3.4. Data access layer: the `BaseRepository`

The heart of data access is the abstract class **`BaseRepository`** (`modules/database/base.repository.ts`). It receives the `pg` `Pool` by injection and offers reusable helpers:

```typescript
export abstract class BaseRepository {
  constructor(protected pool: Pool) {}

  // Runs a parameterized query with error handling
  protected async execute<T>(query: string, values: unknown[] = []) {
    try {
      return await this.pool.query<T>(query, values);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  protected async query<T>(query, values)    // returns all rows
  protected async queryOne<T>(query, values) // returns one row or null
  protected async count(query, values)       // returns a COUNT(*) as a number

  // Generic CRUD built dynamically:
  protected async create<T>(tableName, data)        // INSERT ... RETURNING *
  protected async update<T>(tableName, id, data, options)  // dynamic UPDATE
  protected async delete(tableName, id, idColumn)   // DELETE by id
}
```

The generic `create()` builds the `INSERT` from an object, generating the numbered placeholders automatically:

```typescript
const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
const query = `
  INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
  VALUES (${placeholders})
  RETURNING *`;
```

A **concrete repository** looks like this (clinic module example):

```typescript
@Injectable()
export class ClinicRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Clinic[]> {
    const query = `
      SELECT id_clinic AS id, name, province, address
      FROM "Clinic"
      ORDER BY name ASC`;
    return this.query<Clinic>(query);
  }

  async search(filters: SearchClinicsFilters): Promise<Clinic[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;
    if (filters.name) {
      paramCount++;
      conditions.push(`c.name ILIKE $${paramCount}`);
      params.push(`%${filters.name}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    // ... + LIMIT / OFFSET for pagination
  }
}
```

**Characteristics of the data access style:**

- **Parameterized plain SQL** with numbered placeholders (`$1`, `$2`, …). This prevents **SQL injection**.
- **No ORM or query builder** (no TypeORM, Prisma or Knex); queries are written by hand, giving full control and optimized queries for the reports.
- **Manual mapping** of DB column names (e.g. `id_clinic`) to domain model properties (`id`) via SQL aliases (`AS id`).
- **Pagination** with `LIMIT`/`OFFSET` and **dynamic filters** built conditionally.
- **Error handling** centralized in `execute()` (log + re-throw).
- **No explicit transactions:** all queries run in autocommit mode. Access is via `pg.Pool`, which manages the connection pool.

### 3.5. Validation with Zod

Validation is **not defined in the API** but in the shared `@repo/schemas` package. There each domain defines its Zod schemas and turns them into NestJS DTOs with `createZodDto`:

```typescript
// packages/schemas/src/service-offered/service-offered.dto.ts
import { createZodDto } from "nestjs-zod";

export class CreateServiceOfferedDto extends createZodDto(createServiceOfferedSchema) {}
export class UpdateServiceOfferedDto extends createZodDto(updateServiceOfferedSchema) {}
```

In the controller, by typing `@Body() data: CreateServiceOfferedDto`, the global `ZodValidationPipe` validates the request body against the Zod schema **before** running the method. If it fails, NestJS automatically returns a `400 Bad Request` with the details.

### 3.6. Error handling

- The **native NestJS exception hierarchy** is used (`NotFoundException`, `BadRequestException`, etc.).
- The **service** layer throws `NotFoundException` when an entity does not exist; NestJS turns it into a `404`.
- **Database errors** are caught in `BaseRepository.execute()`, logged to the console and re-thrown.
- **No custom exception filters or authentication/guards** are implemented: the API is open access and delegates the error response format to NestJS's default exception handler.

### 3.7. Module catalog

| Module | Base route | Description |
|--------|-----------|-------------|
| **database** | — | Infrastructure: connection pool + `BaseRepository`. Exposes no routes. |
| **animal** | `/animals` | Animal CRUD + search + statistics (`/stats`). Computes age with `EXTRACT(YEAR FROM AGE(birth_date))`. |
| **adoption** | `/adoptions` | Adoption records. |
| **activity-schedule** | `/activity-schedules` | Activity schedule (vaccination, feeding, transport…) for animals. |
| **clinic** | `/clinics` | Veterinary clinics. |
| **contract** | `/contracts` | Contracts with suppliers (uses `PATCH` to update). |
| **donation** | `/donations` | Donations received. |
| **reports** | `/reports` | **Analytical reports** with complex JOINs (see below). |
| **service-offered** | `/services-offered` | Services offered under a contract. |
| **supplier** | `/suppliers` | Suppliers (veterinarians, food and service companies). |
| **transport-service** | `/transport-services` | Transport services (extension of a contract). |
| **veterinarian** | `/veterinarians` | Specialized veterinarian data. |

Each domain module exposes the usual set of REST endpoints: `GET /` (list), `GET /search` (search with filters + pagination), `GET /:id`, `POST /`, `PUT|PATCH /:id`, `DELETE /:id`.

The **`reports`** module is special: instead of CRUD, it exposes read-only analytical queries built with JOINs across several tables:

- `GET /reports/reconciled-veterinarian-contracts` — reconciled veterinary contracts.
- `GET /reports/food-supplier-contracts` — food supplier contracts.
- `GET /reports/complementary-service-contracts` — complementary service contracts.
- `GET /reports/active-veterinarians` — active veterinarians.
- `GET /reports/animal-care-schedule` — animal care schedule.
- `GET /reports/revenue-plan` — revenue plan/projection.

---

## 4. Database (PostgreSQL)

### 4.1. Provisioning with Docker

The database is provisioned with **Docker Compose** using the official **`postgres:15-alpine`** image (`docker-compose.yml`):

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: animal-shelter-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - ./apps/api/db-init:/docker-entrypoint-initdb.d   # init scripts
      - pgdata:/var/lib/postgresql/data                  # persistence
```

Variables in the root `.env`:

```
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=animal_shelter_db
DB_PORT=5434
```

Important details:

- The host port is **5434** (mapped to the container's internal `5432`).
- The `apps/api/db-init` folder is mounted into `/docker-entrypoint-initdb.d`. PostgreSQL **automatically** runs all `.sql` files in that folder, in **alphabetical order**, the first time the container starts (empty volume).
- Data persists in the named volume `pgdata`.

### 4.2. Data model and relationships

The schema (`apps/api/db-init/01-schema.sql`) defines **11 tables**. All primary keys are `SERIAL` except the extension tables that share the PK with their parent table. It uses `CHECK` constraints to emulate enums and indexes to speed up frequent queries.

**Main tables:**

| Table | PK | Notable fields | Relationships |
|-------|----|-----|-----------|
| **ShelterConfiguration** | `id_config` | `maintenance_percentage` | (global configuration) |
| **Clinic** | `id_clinic` | `name`, `province`, `address` | — |
| **Supplier** | `id_supplier` | `name`, `type` (CHECK: Veterinarian/Food Company/Service Company), `phone`, `contact_email`, `province` | — |
| **Veterinarian** | `id_supplier` (FK→Supplier) | `modality`, `specialty`, `city_distance` | 1:1 with Supplier, N:1 with Clinic (`id_clinic`) |
| **Contract** | `id_contract` | `contract_category` (CHECK: Veterinarian/Food/Service), `start_date`, `end_date`, `status`, `base_price` | N:1 with Supplier (`id_supplier`) |
| **TransportService** | `id_contract` (FK→Contract) | `vehicle`, `transport_modality` | 1:1 with Contract |
| **ServiceOffered** | `id_service` | `name`, `service_type`, `food_type` | N:1 with Contract (`id_contract`) |
| **Animal** | `id_animal` | `species`, `breed`, `birth_date`, `weight`, `entry_date`, `status` (CHECK: available/adopted/reserved/deceased) | — |
| **ActivitySchedule** | `id_schedule` | `activity_type`, `date`, `time`, `duration_days`, `additional_surcharge` | N:1 with Animal and with Contract |
| **Adoption** | `id_adoption` | `adoption_date`, `adoption_price` | N:1 with Animal |
| **Donation** | `id_donation` | `amount`, `date`, `donor` | N:1 with Animal |

**Relationship diagram (summary):**

```
Supplier ──1:1── Veterinarian ──N:1── Clinic
   │
   └──1:N── Contract ──1:1── TransportService
                │
                └──1:N── ServiceOffered

Animal ──1:N── ActivitySchedule ──N:1── Contract
  ├──1:N── Adoption
  └──1:N── Donation

ShelterConfiguration   (global configuration table)
```

**Notable constraints and design:**

- `Contract` has a `CHECK (end_date >= start_date)` and `base_price >= 0`.
- `Veterinarian` and `TransportService` apply an **inheritance/extension by shared key** pattern: their PK *is* the FK to the parent table (`Supplier` and `Contract` respectively), modeling a 1:1 relationship.
- Indexes on frequently filtered columns: `Supplier(province, type)`, `Contract(contract_category, start_date, end_date, status)`, `ServiceOffered(id_contract)`, `Animal(species, status, entry_date DESC)`, `ActivitySchedule(date)`.

### 4.3. Initialization scripts

In `apps/api/db-init/`, run in alphabetical order when the container is created:

1. **`01-schema.sql`** — creates the 11 tables, `CHECK` constraints, foreign keys and indexes.
2. **`02-seed.sql`** — initial data: configuration, clinics, suppliers, veterinarians, contracts, transport services, services offered, animals (with various statuses), schedules, adoptions and donations. Synchronizes the `SERIAL` sequences with `setval()`.
3. **`03-seed.sql`** — supplementary `ServiceOffered` data.
4. **`04-sync_sequence_max_id.sql`** — re-synchronizes the `Donation` sequence with `MAX(id_donation)` so that auto-increment continues correctly.

**There is no formal migration system** (Prisma, TypeORM, Flyway…): the schema is static and applied only once at container startup. Schema changes require editing the SQL and recreating the volume.

### 4.4. Connection from the API

The connection is configured in `apps/api/src/modules/database/config/database.config.ts`:

```typescript
export function createDatabasePool(): Pool {
  const config: PoolConfig = {
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME     || 'animal_shelter',
  };
  return new Pool(config);
}
```

The `DatabaseModule` is a global NestJS module that creates the pool with an async *factory*, tests the connection (`connectToDatabase()` logs ✓/✗ to the console) and exposes it through the `DATABASE_CONNECTION` token. Each concrete repository receives it by injection:

```typescript
constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
  super(pool);
}
```

---

## 5. The `@repo/schemas` package

`packages/schemas` is the **most strategic** package in the monorepo: it defines the **single source of truth** for validation and types, shared between API and web.

- **Name:** `@repo/schemas` (version `1.0.0`).
- **Libraries:** `zod` (schema definition) + `nestjs-zod` (`createZodDto` to generate NestJS DTOs).
- **Dual ESM/CommonJS exports** so it can be consumed by both the web (Vite/ESM) and the API (NestJS/CommonJS).

**Organization:** one folder per domain under `src/` (17 domains), each one with:

- `[domain].ts` — Zod schemas and inferred types.
- `[domain].dto.ts` — NestJS DTOs generated with `createZodDto`.
- `index.ts` — barrel export.

And a root `src/index.ts` that re-exports all the domains. The domains include: `animal`, `adoption`, `activity-schedule`, `clinic`, `contract`, `donation`, `service-offered`, `supplier`, `transport-service`, `veterinarian`, plus report-specific domains (`active-veterinarians`, `animal-care-schedule`, `complementary-service-contracts`, `food-supplier-contracts`, `revenue-plan`, `veterinarian-contracts`).

**Definition pattern** (`contract` example):

```typescript
import { z } from "zod";

export const contractCategoryEnum = z.enum(["Veterinarian", "Food", "Service"]);
export const contractStatusEnum   = z.enum(["Active", "Inactive", "Expired"]);

const contractBaseSchema = z.object({
  id_supplier: z.number().int().positive("Supplier ID must be positive"),
  contract_category: contractCategoryEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  status: contractStatusEnum.default("Active"),
  base_price: z.number().nonnegative("Base price must be >= 0"),
});

// Variants derived from the base schema:
export const createContractSchema = contractBaseSchema.refine(
  (d) => d.end_date >= d.start_date,
  { message: "End date must be >= start date" },
);
export const updateContractSchema = contractBaseSchema.partial();   // all optional
export const contractSchema       = contractBaseSchema.extend({ id: z.number().int() });

// Automatically inferred types:
export type CreateContract = z.infer<typeof createContractSchema>;
export type Contract       = z.infer<typeof contractSchema>;
```

Core idea: from **one base schema** the variants `create` (refined), `update` (`.partial()`), `search` (filters) and the full entity are derived, and from each one the **TypeScript type is inferred** with `z.infer`. This way, validation and types never get out of sync.

**Dual consumption:**

- In the **API**, the `*.dto.ts` (`createZodDto`) are used in controllers → automatic validation via `ZodValidationPipe`.
- In the **web**, the schemas are used with React Hook Form's `zodResolver` to validate forms, and the inferred types type the API calls.

---

## 6. The web frontend (React + Vite)

`apps/web` is a modern SPA built with **React 19** and **Vite 5**, heavily leaning on the **TanStack** ecosystem.

**Main libraries (with their role):**

| Library | Version | Role |
|----------|---------|-----|
| **React / React DOM** | 19.2 | UI library |
| **Vite** | 5.1 | Bundler / dev server |
| **TanStack Router** | 1.170 | **File-based** routing (generates `routeTree.gen.ts`) |
| **TanStack Query** | 5.100 | Server state: fetching, caching, mutations |
| **TanStack Table** | — | Data tables (lists) |
| **React Hook Form** | 7.76 | Form state and validation |
| **@hookform/resolvers** | 5.4 | Bridge between RHF and Zod (`zodResolver`) |
| **Zod** | 3.25 | Client-side validation (reusing `@repo/schemas`) |
| **Tailwind CSS** | 4.3 | Utility styling (+ `@tailwindcss/vite`) |
| **Radix UI** (via `@repo/ui`) | — | Accessible UI primitives |
| **nuqs** | 2.8 | Filter/pagination state synced with the URL |
| **Recharts** | 2.10 | Charts (dashboard / reports) |
| **Sonner** | 2.0 | *Toast* notifications |
| **Lucide React** | 0.331 | SVG icons |
| **Zustand** | 5.0 | Global client state (minimal use) |

**Structure of `apps/web/src`:**

```
src/
├── components/
│   ├── dashboard/
│   ├── fields/          # React Hook Form wrappers
│   │   ├── rhf-input.tsx
│   │   ├── rhf-date-input.tsx
│   │   ├── rhf-number-input.tsx
│   │   ├── rhf-select.tsx
│   │   └── rhf-fk-select.tsx   # Foreign-key select (loads options with Query)
│   └── custom-table.tsx        # TanStack Table wrapper
├── modules/             # One module per entity (mirrors the backend)
│   └── contract/
│       ├── forms/       # create-contract, edit-contract, contract-form-fields
│       ├── list/        # contracts-list (table + filters)
│       └── services.ts  # API client (fetch) for the entity
├── routes/              # File-based routes (TanStack Router)
│   └── contracts/
│       ├── index.tsx              → /contracts
│       ├── new.tsx                → /contracts/new
│       └── $contractId.edit.tsx   → /contracts/:contractId/edit
├── store/useBoundStore.ts        # Zustand
├── routeTree.gen.ts              # Auto-generated (do NOT edit)
└── main.tsx                      # Entry point
```

**Routing:** the `TanStackRouterVite` plugin (in `vite.config.ts`) scans the `routes/` folder and generates `routeTree.gen.ts` automatically. Each route is a file that exports `createFileRoute`:

```typescript
export const Route = createFileRoute("/contracts/")({
  component: ContractsList,
});
```

**Pattern of a module (`contract` example):**

- **`services.ts`** — HTTP client with native `fetch`. The base URL comes from `import.meta.env.VITE_PUBLIC_API_URL` (`http://localhost:3002`). There is no axios or dedicated client; TanStack Query manages caching and mutations:

  ```typescript
  const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
  export const fetchContracts = async (filters = {}) => {
    const params = new URLSearchParams(/* ...filters... */);
    const res = await fetch(`${API_URL}/contracts/search?${params}`);
    if (!res.ok) throw new Error("Failed to fetch contracts");
    return res.json();
  };
  ```

- **Lists (`list/contracts-list.tsx`)** — use `useQuery` to fetch data, `nuqs` (`useQueryStates`) to keep filters and pagination in the URL, and `TanStack Table` (via `CustomTable`) to render the columns. Deletions use `useMutation` + `invalidateQueries`.

- **Forms (`forms/edit-contract.tsx`)** — use `useForm` with `zodResolver(createContractSchema)` (the same schema as the backend!), `useMutation` for `POST`/`PATCH`, invalidate the cache in `onSuccess` and show a *toast* with Sonner.

- **Reusable fields (`components/fields/`)** — generic RHF wrappers (`<Controller>`) that standardize inputs, selects, dates and foreign-key selects. `RHFFkSelect` even uses `useQuery` internally to dynamically load the options (e.g. the supplier list).

The result is a very **consistent and declarative** pattern: for each entity there is a `services.ts` (data), a `list/` folder (table with URL filters) and a `forms/` folder (create/edit with shared Zod validation).

---

## 7. Auxiliary shared packages

| Package | Content |
|---------|---------|
| **`@repo/ui`** | UI component library based on **Radix UI + Tailwind + CVA**: `Button`, `Card`, `Select`, `Input`, `Label`, `Tabs`, `DatePicker`, etc. Consumed by the web. |
| **`@repo/eslint-config`** | Shared ESLint configuration (TypeScript + Prettier) for the whole monorepo. |
| **`@repo/typescript-config`** | Base `tsconfig` extended by all packages/apps. |

At the root level, **Husky + lint-staged + commitlint** guarantee quality: automatic formatting and commit message validation (Conventional Commits) on every *commit*.

---

## 8. Getting started

```bash
# 1. Install dependencies (from the root)
pnpm install

# 2. Bring up the PostgreSQL database (Docker)
docker compose up -d
#    → creates the 'animal-shelter-db' container, exposes port 5434
#    → automatically runs the scripts in apps/api/db-init/

# 3. Start API + Web in development mode (Turborepo)
pnpm dev
#    → API:  http://localhost:3002
#    → Web:  http://localhost:5173
```

**Relevant environment variables:**

| Variable | Where | Default |
|----------|-------|-------------------|
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | root `.env` | postgres / postgres / animal_shelter_db |
| `DB_PORT` | root `.env` | 5434 |
| `DB_HOST` | API | localhost |
| `WEB_URL` | API (CORS) | http://localhost:5173 |
| `VITE_PUBLIC_API_URL` | Web | http://localhost:3002 |

---

### Final summary

This project is a **modern full-stack monorepo** that stands out for:

- **End-to-end type safety** thanks to shared Zod via `@repo/schemas`.
- A **clean, layered NestJS API** (Controller → Service → Repository) with **parameterized plain SQL** over PostgreSQL, without the overhead of an ORM.
- A **declarative frontend** built on the TanStack ecosystem (Router/Query/Table) with a uniform module pattern.
- Well-integrated monorepo tooling (pnpm + Turborepo) and quality tooling (ESLint/Prettier/Husky).

---
---

# 🇪🇸 Versión en español

# Animal Shelter App 🐾

Aplicación full‑stack para la **gestión integral de un refugio de animales**: administra animales, adopciones, donaciones, clínicas veterinarias, proveedores, contratos de servicios, servicios ofrecidos, transporte, agenda de actividades y reportes analíticos.

Este documento (`Readmev2.md`) es una explicación **completa y detallada** del proyecto, con énfasis en la **API** (patrones, módulos y base de datos), el **paquete de esquemas compartidos** y una visión general del **frontend web** y sus librerías.

---

## Tabla de contenidos

1. [Arquitectura general (monorepo)](#1-arquitectura-general-monorepo)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [La API (NestJS) — explicación profunda](#3-la-api-nestjs--explicación-profunda)
   - [Arranque y configuración](#31-arranque-y-configuración-maints)
   - [Patrones de arquitectura](#32-patrones-de-arquitectura)
   - [Anatomía de un módulo](#33-anatomía-de-un-módulo)
   - [Capa de acceso a datos: el `BaseRepository`](#34-capa-de-acceso-a-datos-el-baserepository)
   - [Validación con Zod](#35-validación-con-zod)
   - [Manejo de errores](#36-manejo-de-errores)
   - [Catálogo de módulos](#37-catálogo-de-módulos)
4. [Base de datos (PostgreSQL)](#4-base-de-datos-postgresql)
   - [Provisión con Docker](#41-provisión-con-docker)
   - [Modelo de datos y relaciones](#42-modelo-de-datos-y-relaciones)
   - [Scripts de inicialización](#43-scripts-de-inicialización)
   - [Conexión desde la API](#44-conexión-desde-la-api)
5. [El paquete `@repo/schemas`](#5-el-paquete-reposchemas)
6. [El frontend web (React + Vite)](#6-el-frontend-web-react--vite)
7. [Paquetes compartidos auxiliares](#7-paquetes-compartidos-auxiliares)
8. [Puesta en marcha](#8-puesta-en-marcha)

---

## 1. Arquitectura general (monorepo)

El proyecto es un **monorepo** gestionado con **pnpm workspaces** y orquestado con **Turborepo**. La estructura raíz es:

```
animal-shelter-app/
├── apps/
│   ├── api/          # Backend NestJS + PostgreSQL
│   └── web/          # Frontend React + Vite
├── packages/
│   ├── schemas/      # @repo/schemas  → esquemas Zod + DTOs compartidos
│   ├── ui/           # @repo/ui       → componentes UI (Radix + Tailwind)
│   ├── eslint-config/        # @repo/eslint-config
│   └── typescript-config/    # @repo/typescript-config
├── docker-compose.yml        # Base de datos PostgreSQL
├── pnpm-workspace.yaml
├── turbo.json
└── .env
```

`pnpm-workspace.yaml` declara los workspaces y fuerza una versión única de Zod en todo el monorepo (`overrides: zod: ^4.1.13`), evitando conflictos de versiones entre la API y la web:

```yaml
packages:
  - "apps/*"
  - "packages/*"
overrides:
  zod: ^4.1.13
```

**Turborepo** (`turbo.json`) define las tareas `build`, `dev` y `lint` con cacheo incremental. Desde la raíz: `pnpm dev`, `pnpm build`, `pnpm lint`.

**Ventaja clave del monorepo:** el paquete `@repo/schemas` define los esquemas de validación y los tipos **una sola vez** y los comparten tanto la API (para validar peticiones) como la web (para validar formularios e inferir tipos). Esto da **seguridad de tipos de extremo a extremo**.

---

## 2. Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **API** | NestJS 11, Express 5, TypeScript 5.7, `pg` (PostgreSQL), Zod 4 + nestjs-zod |
| **Base de datos** | PostgreSQL 15 (Alpine) en Docker, SQL plano (sin ORM) |
| **Esquemas** | Zod + nestjs-zod (`createZodDto`) en `@repo/schemas` |
| **Web** | React 19, Vite 5, TanStack Router / Query / Table, React Hook Form, Zod, Tailwind 4, Radix UI, nuqs, Recharts, Sonner, Lucide |
| **Calidad** | ESLint, Prettier, Husky, lint-staged, commitlint |

---

## 3. La API (NestJS) — explicación profunda

La API está construida con **NestJS 11** sobre **Express 5**, escrita en TypeScript. Sigue una **arquitectura modular en capas** sin ORM: el acceso a datos se hace con **SQL plano parametrizado** mediante el driver `pg`.

Estructura de `apps/api/src`:

```
src/
├── main.ts              # Punto de entrada / bootstrap del servidor
├── app.module.ts        # Módulo raíz: importa todos los módulos de dominio
├── app.controller.ts
├── app.service.ts
└── modules/
    ├── database/        # Conexión a BD + repositorio base (núcleo de infraestructura)
    │   ├── database.module.ts
    │   ├── base.repository.ts
    │   └── config/database.config.ts
    ├── animal/
    ├── adoption/
    ├── activity-schedule/
    ├── clinic/
    ├── contract/
    ├── donation/
    ├── reports/
    ├── service-offered/
    ├── supplier/
    ├── transport-service/
    └── veterinarian/
```

### 3.1. Arranque y configuración (`main.ts`)

El `main.ts` realiza el bootstrap:

```typescript
// Carga variables de entorno ANTES de importar el resto de módulos
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());   // Validación global con Zod
  app.enableCors({
    origin: process.env.WEB_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3002);
}
```

Puntos clave:

- **Puerto:** `3002`.
- **CORS:** habilitado, el origen permitido proviene de `WEB_URL` (la web corre en `http://localhost:5173`).
- **Validación global:** se registra un `ZodValidationPipe` de `nestjs-zod`, de modo que **todo** `@Body()`, `@Query()` o `@Param()` tipado con un DTO de Zod se valida automáticamente antes de llegar al controlador.
- **Variables de entorno:** se cargan con `dotenv` tanto del `.env` raíz como del de `apps/api`.

El **módulo raíz** (`app.module.ts`) simplemente importa el `DatabaseModule` y los 11 módulos de dominio:

```typescript
@Module({
  imports: [
    DatabaseModule, AnimalsModule, ClinicsModule, SupplierModule,
    ReportsModule, ContractModule, TransportServiceModule, VeterinarianModule,
    ServiceOfferedModule, ActivityScheduleModule, DonationModule, AdoptionModule,
  ],
})
export class AppModule {}
```

### 3.2. Patrones de arquitectura

La API combina varios patrones clásicos de NestJS:

1. **Arquitectura modular por feature:** cada entidad del dominio es un módulo NestJS independiente y autocontenido.
2. **Inyección de dependencias (DI):** se usa el contenedor de DI de NestJS con inyección por constructor.
3. **Patrón en capas (Controller → Service → Repository):**
   - **Controller** — define las rutas HTTP REST y delega en el servicio.
   - **Service** — contiene la lógica de negocio y lanza excepciones de dominio (p. ej. `NotFoundException`).
   - **Repository** — encapsula el acceso a datos (SQL).
4. **Repository Pattern con clase base:** todos los repositorios extienden un `BaseRepository` abstracto que centraliza la ejecución de consultas, el manejo de errores y operaciones CRUD genéricas.

El flujo de una petición es:

```
HTTP → Controller → Service → Repository → (pg.Pool) → PostgreSQL
                       ↑ ZodValidationPipe valida el body/query antes del controlador
```

### 3.3. Anatomía de un módulo

Tomemos el módulo **`service-offered`** como ejemplo representativo. Contiene cuatro archivos:

**`service-offered.module.ts`** — declara el módulo, importa `DatabaseModule` (para acceder al pool), registra el servicio y el repositorio como *providers* y exporta el servicio para que otros módulos puedan reutilizarlo.

**`service-offered.controller.ts`** — define los endpoints REST:

```typescript
@Controller('services-offered')
export class ServiceOfferedController {
  constructor(private readonly serviceOfferedService: ServiceOfferedService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOfferedService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateServiceOfferedDto) {
    return this.serviceOfferedService.create(data);
  }
}
```

Nótese el uso de `ParseIntPipe` (convierte y valida el `:id` numérico) y los DTOs (`CreateServiceOfferedDto`) que disparan la validación Zod global.

**`service-offered.service.ts`** — lógica de negocio; traduce "no encontrado" en una excepción HTTP:

```typescript
@Injectable()
export class ServiceOfferedService {
  constructor(private readonly serviceOfferedRepository: ServiceOfferedRepository) {}

  async findById(id: number): Promise<ServiceOffered> {
    const service = await this.serviceOfferedRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service offered with ID ${id} not found`);
    }
    return service;
  }
}
```

**`service-offered.repository.ts`** — acceso a datos; extiende `BaseRepository`, escribe SQL parametrizado y mapea las filas de la BD a modelos de dominio.

Este patrón de **4 archivos por módulo** (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`) se repite de forma idéntica en todos los módulos de dominio, lo que hace el código muy predecible.

### 3.4. Capa de acceso a datos: el `BaseRepository`

El corazón del acceso a datos es la clase abstracta **`BaseRepository`** (`modules/database/base.repository.ts`). Recibe el `Pool` de `pg` por inyección y ofrece helpers reutilizables:

```typescript
export abstract class BaseRepository {
  constructor(protected pool: Pool) {}

  // Ejecuta una consulta parametrizada con manejo de errores
  protected async execute<T>(query: string, values: unknown[] = []) {
    try {
      return await this.pool.query<T>(query, values);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  protected async query<T>(query, values)    // devuelve todas las filas
  protected async queryOne<T>(query, values) // devuelve una fila o null
  protected async count(query, values)       // devuelve un COUNT(*) como número

  // CRUD genérico construido dinámicamente:
  protected async create<T>(tableName, data)        // INSERT ... RETURNING *
  protected async update<T>(tableName, id, data, options)  // UPDATE dinámico
  protected async delete(tableName, id, idColumn)   // DELETE por id
}
```

El `create()` genérico construye el `INSERT` a partir de un objeto, generando los placeholders numerados automáticamente:

```typescript
const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
const query = `
  INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
  VALUES (${placeholders})
  RETURNING *`;
```

Un **repositorio concreto** se ve así (ejemplo del módulo clinic):

```typescript
@Injectable()
export class ClinicRepository extends BaseRepository {
  constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Clinic[]> {
    const query = `
      SELECT id_clinic AS id, name, province, address
      FROM "Clinic"
      ORDER BY name ASC`;
    return this.query<Clinic>(query);
  }

  async search(filters: SearchClinicsFilters): Promise<Clinic[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramCount = 0;
    if (filters.name) {
      paramCount++;
      conditions.push(`c.name ILIKE $${paramCount}`);
      params.push(`%${filters.name}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    // ... + LIMIT / OFFSET para paginación
  }
}
```

**Características del estilo de acceso a datos:**

- **SQL plano parametrizado** con placeholders numerados (`$1`, `$2`, …). Esto previene **inyección SQL**.
- **Sin ORM ni query builder** (no hay TypeORM, Prisma ni Knex); las consultas se escriben a mano, lo que da control total y consultas optimizadas para los reportes.
- **Mapeo manual** de nombres de columna de la BD (p. ej. `id_clinic`) a propiedades del modelo de dominio (`id`) mediante alias SQL (`AS id`).
- **Paginación** con `LIMIT`/`OFFSET` y **filtros dinámicos** construidos condicionalmente.
- **Manejo de errores** centralizado en `execute()` (log + re‑lanzamiento).
- **Sin transacciones explícitas:** todas las consultas se ejecutan en modo autocommit. El acceso es vía `pg.Pool`, que gestiona el pool de conexiones.

### 3.5. Validación con Zod

La validación **no se define en la API** sino en el paquete compartido `@repo/schemas`. Allí cada dominio define sus esquemas Zod y los convierte en DTOs de NestJS con `createZodDto`:

```typescript
// packages/schemas/src/service-offered/service-offered.dto.ts
import { createZodDto } from "nestjs-zod";

export class CreateServiceOfferedDto extends createZodDto(createServiceOfferedSchema) {}
export class UpdateServiceOfferedDto extends createZodDto(updateServiceOfferedSchema) {}
```

En el controlador, al tipar `@Body() data: CreateServiceOfferedDto`, el `ZodValidationPipe` global valida el cuerpo de la petición contra el esquema Zod **antes** de ejecutar el método. Si falla, NestJS devuelve automáticamente un `400 Bad Request` con los detalles.

### 3.6. Manejo de errores

- Se usa la **jerarquía de excepciones nativa de NestJS** (`NotFoundException`, `BadRequestException`, etc.).
- La capa **service** lanza `NotFoundException` cuando una entidad no existe; NestJS lo convierte en `404`.
- Los **errores de base de datos** se capturan en `BaseRepository.execute()`, se registran en consola y se re‑lanzan.
- **No hay filtros de excepción personalizados ni autenticación/guards** implementados: la API es de acceso abierto y delega el formato de respuesta de error al manejador de excepciones por defecto de NestJS.

### 3.7. Catálogo de módulos

| Módulo | Ruta base | Descripción |
|--------|-----------|-------------|
| **database** | — | Infraestructura: pool de conexión + `BaseRepository`. No expone rutas. |
| **animal** | `/animals` | CRUD de animales + búsqueda + estadísticas (`/stats`). Calcula la edad con `EXTRACT(YEAR FROM AGE(birth_date))`. |
| **adoption** | `/adoptions` | Registros de adopciones. |
| **activity-schedule** | `/activity-schedules` | Agenda de actividades (vacunación, alimentación, transporte…) para animales. |
| **clinic** | `/clinics` | Clínicas veterinarias. |
| **contract** | `/contracts` | Contratos con proveedores (usa `PATCH` para actualizar). |
| **donation** | `/donations` | Donaciones recibidas. |
| **reports** | `/reports` | **Reportes analíticos** con JOINs complejos (ver abajo). |
| **service-offered** | `/services-offered` | Servicios ofrecidos bajo un contrato. |
| **supplier** | `/suppliers` | Proveedores (veterinarios, empresas de comida y de servicios). |
| **transport-service** | `/transport-services` | Servicios de transporte (extensión de un contrato). |
| **veterinarian** | `/veterinarians` | Datos especializados de veterinarios. |

Cada módulo de dominio expone el conjunto habitual de endpoints REST: `GET /` (listar), `GET /search` (buscar con filtros + paginación), `GET /:id`, `POST /`, `PUT|PATCH /:id`, `DELETE /:id`.

El módulo **`reports`** es especial: en lugar de CRUD, expone consultas analíticas de solo lectura construidas con JOINs entre varias tablas:

- `GET /reports/reconciled-veterinarian-contracts` — contratos veterinarios conciliados.
- `GET /reports/food-supplier-contracts` — contratos de proveedores de comida.
- `GET /reports/complementary-service-contracts` — contratos de servicios complementarios.
- `GET /reports/active-veterinarians` — veterinarios activos.
- `GET /reports/animal-care-schedule` — agenda de cuidado de animales.
- `GET /reports/revenue-plan` — plan/proyección de ingresos.

---

## 4. Base de datos (PostgreSQL)

### 4.1. Provisión con Docker

La base de datos se provisiona con **Docker Compose** usando la imagen oficial **`postgres:15-alpine`** (`docker-compose.yml`):

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: animal-shelter-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - ./apps/api/db-init:/docker-entrypoint-initdb.d   # scripts de init
      - pgdata:/var/lib/postgresql/data                  # persistencia
```

Variables en el `.env` raíz:

```
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=animal_shelter_db
DB_PORT=5434
```

Detalles importantes:

- El puerto del host es **5434** (mapeado al `5432` interno del contenedor).
- La carpeta `apps/api/db-init` se monta en `/docker-entrypoint-initdb.d`. PostgreSQL ejecuta **automáticamente** todos los `.sql` de esa carpeta, en **orden alfabético**, la primera vez que arranca el contenedor (volumen vacío).
- Los datos persisten en el volumen nombrado `pgdata`.

### 4.2. Modelo de datos y relaciones

El esquema (`apps/api/db-init/01-schema.sql`) define **11 tablas**. Todas las claves primarias son `SERIAL` excepto las tablas de extensión que comparten la PK con su tabla padre. Usa `CHECK` constraints para emular enums e índices para acelerar las consultas frecuentes.

**Tablas principales:**

| Tabla | PK | Campos destacados | Relaciones |
|-------|----|-----|-----------|
| **ShelterConfiguration** | `id_config` | `maintenance_percentage` | (configuración global) |
| **Clinic** | `id_clinic` | `name`, `province`, `address` | — |
| **Supplier** | `id_supplier` | `name`, `type` (CHECK: Veterinarian/Food Company/Service Company), `phone`, `contact_email`, `province` | — |
| **Veterinarian** | `id_supplier` (FK→Supplier) | `modality`, `specialty`, `city_distance` | 1:1 con Supplier, N:1 con Clinic (`id_clinic`) |
| **Contract** | `id_contract` | `contract_category` (CHECK: Veterinarian/Food/Service), `start_date`, `end_date`, `status`, `base_price` | N:1 con Supplier (`id_supplier`) |
| **TransportService** | `id_contract` (FK→Contract) | `vehicle`, `transport_modality` | 1:1 con Contract |
| **ServiceOffered** | `id_service` | `name`, `service_type`, `food_type` | N:1 con Contract (`id_contract`) |
| **Animal** | `id_animal` | `species`, `breed`, `birth_date`, `weight`, `entry_date`, `status` (CHECK: available/adopted/reserved/deceased) | — |
| **ActivitySchedule** | `id_schedule` | `activity_type`, `date`, `time`, `duration_days`, `additional_surcharge` | N:1 con Animal y con Contract |
| **Adoption** | `id_adoption` | `adoption_date`, `adoption_price` | N:1 con Animal |
| **Donation** | `id_donation` | `amount`, `date`, `donor` | N:1 con Animal |

**Diagrama de relaciones (resumen):**

```
Supplier ──1:1── Veterinarian ──N:1── Clinic
   │
   └──1:N── Contract ──1:1── TransportService
                │
                └──1:N── ServiceOffered

Animal ──1:N── ActivitySchedule ──N:1── Contract
  ├──1:N── Adoption
  └──1:N── Donation

ShelterConfiguration   (tabla de configuración global)
```

**Restricciones y diseño notables:**

- `Contract` tiene un `CHECK (end_date >= start_date)` y `base_price >= 0`.
- `Veterinarian` y `TransportService` aplican un patrón de **herencia/extensión por clave compartida**: su PK *es* la FK a la tabla padre (`Supplier` y `Contract` respectivamente), modelando una relación 1:1.
- Índices sobre columnas de filtrado frecuente: `Supplier(province, type)`, `Contract(contract_category, start_date, end_date, status)`, `ServiceOffered(id_contract)`, `Animal(species, status, entry_date DESC)`, `ActivitySchedule(date)`.

### 4.3. Scripts de inicialización

En `apps/api/db-init/`, ejecutados en orden alfabético al crear el contenedor:

1. **`01-schema.sql`** — crea las 11 tablas, constraints `CHECK`, claves foráneas e índices.
2. **`02-seed.sql`** — datos iniciales: configuración, clínicas, proveedores, veterinarios, contratos, servicios de transporte, servicios ofrecidos, animales (con distintos estados), agendas, adopciones y donaciones. Sincroniza las secuencias `SERIAL` con `setval()`.
3. **`03-seed.sql`** — datos complementarios de `ServiceOffered`.
4. **`04-sync_sequence_max_id.sql`** — re‑sincroniza la secuencia de `Donation` con el `MAX(id_donation)` para que el auto‑incremento continúe correctamente.

**No existe un sistema de migraciones formal** (Prisma, TypeORM, Flyway…): el esquema es estático y se aplica una sola vez en el arranque del contenedor. Cambios de esquema requieren editar los SQL y recrear el volumen.

### 4.4. Conexión desde la API

La conexión se configura en `apps/api/src/modules/database/config/database.config.ts`:

```typescript
export function createDatabasePool(): Pool {
  const config: PoolConfig = {
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME     || 'animal_shelter',
  };
  return new Pool(config);
}
```

El `DatabaseModule` es un módulo global de NestJS que crea el pool con una *factory* asíncrona, prueba la conexión (`connectToDatabase()` registra ✓/✗ en consola) y lo expone a través del token `DATABASE_CONNECTION`. Cada repositorio concreto lo recibe por inyección:

```typescript
constructor(@Inject(DATABASE_CONNECTION) protected override pool: Pool) {
  super(pool);
}
```

---

## 5. El paquete `@repo/schemas`

`packages/schemas` es el paquete **más estratégico** del monorepo: define la **fuente única de verdad** para validación y tipos, compartida entre API y web.

- **Nombre:** `@repo/schemas` (versión `1.0.0`).
- **Librerías:** `zod` (definición de esquemas) + `nestjs-zod` (`createZodDto` para generar DTOs de NestJS).
- **Exports duales** ESM/CommonJS para que lo consuman tanto la web (Vite/ESM) como la API (NestJS/CommonJS).

**Organización:** un folder por dominio bajo `src/` (17 dominios), cada uno con:

- `[dominio].ts` — esquemas Zod y tipos inferidos.
- `[dominio].dto.ts` — DTOs de NestJS generados con `createZodDto`.
- `index.ts` — barrel export.

Y un `src/index.ts` raíz que re‑exporta todos los dominios. Los dominios incluyen: `animal`, `adoption`, `activity-schedule`, `clinic`, `contract`, `donation`, `service-offered`, `supplier`, `transport-service`, `veterinarian`, además de dominios específicos de reportes (`active-veterinarians`, `animal-care-schedule`, `complementary-service-contracts`, `food-supplier-contracts`, `revenue-plan`, `veterinarian-contracts`).

**Patrón de definición** (ejemplo de `contract`):

```typescript
import { z } from "zod";

export const contractCategoryEnum = z.enum(["Veterinarian", "Food", "Service"]);
export const contractStatusEnum   = z.enum(["Active", "Inactive", "Expired"]);

const contractBaseSchema = z.object({
  id_supplier: z.number().int().positive("Supplier ID must be positive"),
  contract_category: contractCategoryEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  status: contractStatusEnum.default("Active"),
  base_price: z.number().nonnegative("Base price must be >= 0"),
});

// Variantes derivadas del esquema base:
export const createContractSchema = contractBaseSchema.refine(
  (d) => d.end_date >= d.start_date,
  { message: "End date must be >= start date" },
);
export const updateContractSchema = contractBaseSchema.partial();   // todos opcionales
export const contractSchema       = contractBaseSchema.extend({ id: z.number().int() });

// Tipos inferidos automáticamente:
export type CreateContract = z.infer<typeof createContractSchema>;
export type Contract       = z.infer<typeof contractSchema>;
```

Idea central: a partir de **un esquema base** se derivan las variantes `create` (refinado), `update` (`.partial()`), `search` (filtros) y la entidad completa, y de cada una se **infiere el tipo de TypeScript** con `z.infer`. Así, validación y tipos nunca se desincronizan.

**Doble consumo:**

- En la **API**, los `*.dto.ts` (`createZodDto`) se usan en los controladores → validación automática vía `ZodValidationPipe`.
- En la **web**, los esquemas se usan con `zodResolver` de React Hook Form para validar formularios, y los tipos inferidos tipan las llamadas a la API.

---

## 6. El frontend web (React + Vite)

`apps/web` es una SPA moderna construida con **React 19** y **Vite 5**, fuertemente apoyada en el ecosistema **TanStack**.

**Librerías principales (con su rol):**

| Librería | Versión | Rol |
|----------|---------|-----|
| **React / React DOM** | 19.2 | Librería de UI |
| **Vite** | 5.1 | Bundler / dev server |
| **TanStack Router** | 1.170 | Enrutamiento **basado en archivos** (genera `routeTree.gen.ts`) |
| **TanStack Query** | 5.100 | Estado de servidor: fetching, caché, mutaciones |
| **TanStack Table** | — | Tablas de datos (listados) |
| **React Hook Form** | 7.76 | Estado y validación de formularios |
| **@hookform/resolvers** | 5.4 | Puente entre RHF y Zod (`zodResolver`) |
| **Zod** | 3.25 | Validación en cliente (reutilizando `@repo/schemas`) |
| **Tailwind CSS** | 4.3 | Estilos utilitarios (+ `@tailwindcss/vite`) |
| **Radix UI** (vía `@repo/ui`) | — | Primitivos de UI accesibles |
| **nuqs** | 2.8 | Estado de filtros/paginación sincronizado con la URL |
| **Recharts** | 2.10 | Gráficos (dashboard / reportes) |
| **Sonner** | 2.0 | Notificaciones *toast* |
| **Lucide React** | 0.331 | Iconos SVG |
| **Zustand** | 5.0 | Estado de cliente global (uso mínimo) |

**Estructura de `apps/web/src`:**

```
src/
├── components/
│   ├── dashboard/
│   ├── fields/          # Envoltorios de React Hook Form
│   │   ├── rhf-input.tsx
│   │   ├── rhf-date-input.tsx
│   │   ├── rhf-number-input.tsx
│   │   ├── rhf-select.tsx
│   │   └── rhf-fk-select.tsx   # Select de clave foránea (carga opciones con Query)
│   └── custom-table.tsx        # Envoltorio de TanStack Table
├── modules/             # Un módulo por entidad (espejo del backend)
│   └── contract/
│       ├── forms/       # create-contract, edit-contract, contract-form-fields
│       ├── list/        # contracts-list (tabla + filtros)
│       └── services.ts  # Cliente API (fetch) de la entidad
├── routes/              # Rutas basadas en archivos (TanStack Router)
│   └── contracts/
│       ├── index.tsx              → /contracts
│       ├── new.tsx                → /contracts/new
│       └── $contractId.edit.tsx   → /contracts/:contractId/edit
├── store/useBoundStore.ts        # Zustand
├── routeTree.gen.ts              # Generado automáticamente (NO editar)
└── main.tsx                      # Punto de entrada
```

**Enrutamiento:** el plugin `TanStackRouterVite` (en `vite.config.ts`) escanea la carpeta `routes/` y genera `routeTree.gen.ts` automáticamente. Cada ruta es un archivo que exporta `createFileRoute`:

```typescript
export const Route = createFileRoute("/contracts/")({
  component: ContractsList,
});
```

**Patrón de un módulo (ejemplo `contract`):**

- **`services.ts`** — cliente HTTP con `fetch` nativo. La URL base sale de `import.meta.env.VITE_PUBLIC_API_URL` (`http://localhost:3002`). No hay axios ni cliente dedicado; TanStack Query gestiona caché y mutaciones:

  ```typescript
  const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
  export const fetchContracts = async (filters = {}) => {
    const params = new URLSearchParams(/* ...filtros... */);
    const res = await fetch(`${API_URL}/contracts/search?${params}`);
    if (!res.ok) throw new Error("Failed to fetch contracts");
    return res.json();
  };
  ```

- **Listados (`list/contracts-list.tsx`)** — usan `useQuery` para traer datos, `nuqs` (`useQueryStates`) para mantener filtros y paginación en la URL, y `TanStack Table` (vía `CustomTable`) para renderizar las columnas. Las eliminaciones usan `useMutation` + `invalidateQueries`.

- **Formularios (`forms/edit-contract.tsx`)** — usan `useForm` con `zodResolver(createContractSchema)` (¡el mismo esquema del backend!), `useMutation` para `POST`/`PATCH`, invalidan la caché en `onSuccess` y muestran un *toast* con Sonner.

- **Campos reutilizables (`components/fields/`)** — envoltorios genéricos de RHF (`<Controller>`) que estandarizan inputs, selects, fechas y selects de clave foránea. `RHFFkSelect` incluso usa `useQuery` internamente para cargar dinámicamente las opciones (p. ej. la lista de proveedores).

El resultado es un patrón muy **consistente y declarativo**: para cada entidad hay un `services.ts` (datos), una carpeta `list/` (tabla con filtros en URL) y una carpeta `forms/` (alta/edición con validación Zod compartida).

---

## 7. Paquetes compartidos auxiliares

| Paquete | Contenido |
|---------|-----------|
| **`@repo/ui`** | Biblioteca de componentes UI basada en **Radix UI + Tailwind + CVA**: `Button`, `Card`, `Select`, `Input`, `Label`, `Tabs`, `DatePicker`, etc. Consumida por la web. |
| **`@repo/eslint-config`** | Configuración compartida de ESLint (TypeScript + Prettier) para todo el monorepo. |
| **`@repo/typescript-config`** | `tsconfig` base que extienden todos los paquetes/apps. |

A nivel raíz, **Husky + lint-staged + commitlint** garantizan calidad: formateo automático y validación de mensajes de commit (Conventional Commits) en cada *commit*.

---

## 8. Puesta en marcha

```bash
# 1. Instalar dependencias (desde la raíz)
pnpm install

# 2. Levantar la base de datos PostgreSQL (Docker)
docker compose up -d
#    → crea el contenedor 'animal-shelter-db', expone el puerto 5434
#    → ejecuta automáticamente los scripts de apps/api/db-init/

# 3. Arrancar API + Web en modo desarrollo (Turborepo)
pnpm dev
#    → API:  http://localhost:3002
#    → Web:  http://localhost:5173
```

**Variables de entorno relevantes:**

| Variable | Dónde | Valor por defecto |
|----------|-------|-------------------|
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `.env` raíz | postgres / postgres / animal_shelter_db |
| `DB_PORT` | `.env` raíz | 5434 |
| `DB_HOST` | API | localhost |
| `WEB_URL` | API (CORS) | http://localhost:5173 |
| `VITE_PUBLIC_API_URL` | Web | http://localhost:3002 |

---

### Resumen final

Este proyecto es un **monorepo full‑stack moderno** que destaca por:

- **Seguridad de tipos de extremo a extremo** gracias a Zod compartido vía `@repo/schemas`.
- Una **API NestJS limpia y en capas** (Controller → Service → Repository) con **SQL plano parametrizado** sobre PostgreSQL, sin la sobrecarga de un ORM.
- Un **frontend declarativo** apoyado en el ecosistema TanStack (Router/Query/Table) con un patrón de módulos uniforme.
- Herramientas de monorepo (pnpm + Turborepo) y de calidad (ESLint/Prettier/Husky) bien integradas.
