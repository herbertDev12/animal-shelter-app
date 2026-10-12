# Animal Shelter App 🐾

A full‑stack application for the **end‑to‑end management of an animal shelter**: it manages users, roles and permissions, animals, adoptions, donations, veterinary clinics, suppliers, service contracts, services offered, transport, an activity schedule and analytical reports.

This document is a **complete and detailed** explanation of the project, with emphasis on the **API** (patterns, auth, modules and database), the **shared schemas package** and a general overview of the **web frontend** and its libraries.

The two most significant changes since the previous revision of this document are:

1. **The data access layer was migrated from the Repository pattern with hand‑written SQL to Prisma ORM.** The `pg` driver and the per‑entity repository classes are gone; the schema is now the single source of truth and services query a fully typed Prisma client.
2. **JWT authentication and authorization were added**, with managed **users, roles and permissions**. The API is no longer open: every route requires a valid token, and mutating routes require a specific permission.

---

## Table of contents

1. [General architecture (monorepo)](#1-general-architecture-monorepo)
2. [Tech stack](#2-tech-stack)
3. [The API (NestJS) — in depth](#3-the-api-nestjs--in-depth)
   - [Bootstrap and configuration](#31-bootstrap-and-configuration-maints)
   - [Architectural patterns](#32-architectural-patterns)
   - [Anatomy of a module](#33-anatomy-of-a-module)
   - [Data access layer: Prisma ORM](#34-data-access-layer-prisma-orm)
   - [Validation with Zod](#35-validation-with-zod)
   - [Error handling](#36-error-handling)
   - [Authentication and authorization (JWT)](#37-authentication-and-authorization-jwt)
   - [Module catalog](#38-module-catalog)
4. [Database (PostgreSQL)](#4-database-postgresql)
   - [Provisioning with Docker](#41-provisioning-with-docker)
   - [Data model and relationships](#42-data-model-and-relationships)
   - [Migrations and seed](#43-migrations-and-seed)
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
│   ├── api/          # NestJS + Prisma + PostgreSQL backend (JWT auth)
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

`pnpm-workspace.yaml` declares the workspaces, forces a single Zod version across the whole monorepo (`overrides: zod: ^4.1.13`) and allowlists the packages whose native build scripts must run (`bcrypt` ships a native addon, so its build has to execute or `require('bcrypt')` fails at runtime):

```yaml
packages:
  - "apps/*"
  - "packages/*"
allowBuilds:
  "@nestjs/core": true
  bcrypt: true
  esbuild: true
  unrs-resolver: true
overrides:
  zod: ^4.1.13
```

**Turborepo** (`turbo.json`) defines the `build`, `dev` and `lint` tasks with incremental caching. From the root: `pnpm dev`, `pnpm build`, `pnpm lint`.

**Key advantage of the monorepo:** the `@repo/schemas` package defines the validation schemas and types **once** and they are shared by both the API (to validate requests) and the web (to validate forms and infer types). This provides **end‑to‑end type safety**.

---

## 2. Tech stack

| Layer        | Technologies                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo** | pnpm workspaces + Turborepo                                                                                                   |
| **API**      | NestJS 11, Express 5, TypeScript 5.7, **Prisma 7** (`@prisma/client` + `@prisma/adapter-pg`), **JWT** (`@nestjs/jwt`, `passport-jwt`, `passport-local`), **bcrypt**, Zod 4 + nestjs-zod |
| **Database** | PostgreSQL 15 (Alpine) on Docker, **accessed through Prisma ORM 7** (driver adapter)                                          |
| **Schemas**  | Zod + nestjs-zod (`createZodDto`) in `@repo/schemas`                                                                          |
| **Web**      | React 19, Vite 5, TanStack Router / Query / Table, React Hook Form, Zod, Tailwind 4, Radix UI, nuqs, Recharts, Sonner, Lucide |
| **Quality**  | ESLint, Prettier, Husky, lint-staged, commitlint                                                                              |

---

## 3. The API (NestJS) — in depth

The API is built with **NestJS 11** on top of **Express 5**, written in TypeScript. It follows a **modular, layered architecture** backed by **Prisma ORM**: services talk to a fully typed Prisma client, and there is no hand‑written repository or raw SQL.

Structure of `apps/api/src`:

```
src/
├── main.ts              # Entry point / server bootstrap
├── app.module.ts        # Root module: imports all domain modules
├── app.controller.ts
├── app.service.ts
├── common/              # Prisma exception filter + scalar conversions
└── modules/
    ├── prisma/          # Prisma client + connection (infrastructure core)
    │   ├── prisma.module.ts
    │   ├── prisma.service.ts
    │   └── database-url.ts
    ├── auth/            # JWT auth, guards, permission catalog
    ├── role/            # Roles + permissions administration
    ├── animal/
    ├── adoption/
    ├── activity/
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
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe()); // Global validation with Zod
  app.useGlobalFilters(new PrismaExceptionFilter()); // Prisma errors → HTTP
  app.enableShutdownHooks(); // lets Prisma disconnect cleanly on SIGTERM
  app.enableCors({
    origin: process.env.WEB_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });
  await app.listen(3002);
}
```

Key points:

- **Port:** `3002`.
- **CORS:** enabled, the allowed origin comes from `WEB_URL` (the web runs on `http://localhost:5173`).
- **Global validation:** a `ZodValidationPipe` from `nestjs-zod` is registered, so that **every** `@Body()`, `@Query()` or `@Param()` typed with a Zod DTO is automatically validated before reaching the controller.
- **Global exception filter:** `PrismaExceptionFilter` translates Prisma error codes into HTTP responses (see §3.6).
- **Graceful shutdown:** `app.enableShutdownHooks()` lets `PrismaService.onModuleDestroy` close the connection on `SIGTERM`.
- **Environment variables:** loaded with `dotenv` from both the root `.env` and the `apps/api` one.

The **root module** (`app.module.ts`) imports the `PrismaModule`, the `AuthModule` / `RoleModule` (auth and administration) and the 11 remaining domain modules:

```typescript
@Module({
  imports: [
    PrismaModule,
    AnimalsModule,
    ClinicsModule,
    SupplierModule,
    ReportsModule,
    ContractModule,
    TransportServiceModule,
    VeterinarianModule,
    ServiceOfferedModule,
    ActivityModule,
    DonationModule,
    AdoptionModule,
    AuthModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 3.2. Architectural patterns

The API combines several classic NestJS patterns:

1. **Modular feature-based architecture:** each domain entity is an independent, self-contained NestJS module.
2. **Dependency injection (DI):** the NestJS DI container is used with constructor injection.
3. **Layered pattern (Controller → Service):**
   - **Controller** — defines the REST HTTP routes and delegates to the service.
   - **Service** — contains the business logic, performs its own data access through Prisma, and throws domain exceptions (e.g. `NotFoundException`).
4. **ORM-backed persistence:** a generated, fully typed Prisma client replaces the former hand-written repository layer. `PrismaService` is the single injectable that owns the connection.
5. **Authentication and authorization via guards:** two global guards (`JwtAuthGuard`, `PermissionsGuard`) run before every handler; routes opt out with `@Public()` and declare their requirement with `@RequirePermission(...)` (see §3.7).

The flow of a request is:

```
HTTP → JwtAuthGuard → PermissionsGuard → Controller → Service → (PrismaService) → PostgreSQL
                                              ↑ ZodValidationPipe validates the body/query before the controller
```

### 3.3. Anatomy of a module

Let's take the **`service-offered`** module as a representative example. It contains three files:

**`service-offered.module.ts`** — declares the module, registers the service as a _provider_ and exports it so other modules can reuse it. It needs no imports: `PrismaModule` is `@Global()`.

**`service-offered.controller.ts`** — defines the REST endpoints and declares the permission each one requires:

```typescript
@Controller("services-offered")
export class ServiceOfferedController {
  constructor(private readonly serviceOfferedService: ServiceOfferedService) {}

  @RequirePermission("service-offered.read")
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.serviceOfferedService.findById(id);
  }

  @RequirePermission("service-offered.create")
  @Post()
  async create(@Body() data: CreateServiceOfferedDto) {
    return this.serviceOfferedService.create(data);
  }
}
```

Note the use of `ParseUUIDPipe` (validates that `:id` is a UUID), the DTOs (`CreateServiceOfferedDto`) that trigger the global Zod validation, and `@RequirePermission` (enforced by `PermissionsGuard`).

**`service-offered.service.ts`** — business logic; injects `PrismaService` and translates "not found" into an HTTP exception:

```typescript
@Injectable()
export class ServiceOfferedService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ServiceOffered> {
    const service = await this.prisma.serviceOffered.findUnique({
      where: { id_service: id },
    });
    if (!service) {
      throw new NotFoundException(`Service offered with ID ${id} not found`);
    }
    return service;
  }
}
```

The service reaches the database directly through `PrismaService`; there is no separate data-access file.

This **3-files-per-module** pattern (`*.module.ts`, `*.controller.ts`, `*.service.ts`) repeats identically across all domain modules, which makes the code very predictable.

### 3.4. Data access layer: Prisma ORM

Data access lives in **Prisma ORM**. The schema at `apps/api/prisma/schema.prisma` is the single source of truth: it describes every table, is versioned through migrations in `apps/api/prisma/migrations/`, and generates a fully typed client.

The schema models the pre-existing PostgreSQL tables as they are, using `@@map` / `@map` to keep the PascalCase table names and snake_case columns:

```prisma
model Animal {
  id_animal  String    @id @default(uuid()) @db.Uuid
  name       String    @db.VarChar(100)
  species    String    @db.VarChar(50)
  breed      String?   @db.VarChar(50)
  birth_date DateTime? @db.Date
  weight     Decimal?  @db.Decimal(6, 2)
  entry_date DateTime  @db.Date
  status     Int?      @default(1) @db.SmallInt // AnimalStatus in @repo/schemas

  activities Activity[]
  adoptions  Adoption[]
  donations  Donation[]

  @@index([species], map: "idx_animals_species")
  @@map("Animal")
}
```

The client is exposed as a single injectable, **`PrismaService`** (`modules/prisma/prisma.service.ts`), which extends `PrismaClient` and implements the NestJS lifecycle hooks so the connection opens on boot and closes on shutdown (since Prisma 7 the connection goes through a driver adapter — the full constructor is shown in §4.4):

```typescript
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`PrismaModule` is `@Global()`, so any service can inject `PrismaService` without importing anything.

A **service** now performs its own queries — there is no repository layer in between:

```typescript
@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Clinic[]> {
    const rows = await this.prisma.clinic.findMany({
      orderBy: { name: "asc" },
    });
    return rows.map(toClinic);
  }

  async findById(id: string): Promise<Clinic> {
    const row = await this.prisma.clinic.findUnique({
      where: { id_clinic: id },
    });
    if (!row) throw new NotFoundException(`Clinic with ID ${id} not found`);
    return toClinic(row);
  }

  async search(filters: SearchClinicsFilters): Promise<Clinic[]> {
    const rows = await this.prisma.clinic.findMany({
      where: {
        name: contains(filters.name),
        province: contains(filters.province),
      },
      orderBy: { name: "asc" },
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });
    return rows.map(toClinic);
  }
}
```

**Characteristics of the data access style:**

- **Type-safe queries.** The generated client types every model, filter and result, so a renamed column is a compile error rather than a runtime surprise.
- **No hand-written SQL.** Filters, pagination and joins are expressed with the Prisma query API; parameterization (and therefore SQL-injection safety) is handled by the client.
- **Versioned schema.** Changes go through `prisma migrate`, which produces reviewable migration files instead of an edit-and-recreate-the-volume workflow.
- **Relation loading with `select` / `include`,** which replaces the hand-written `INNER JOIN`s and the manual row→model mapping.
- **Explicit transactions** where several tables must move together: `prisma.$transaction()` for the `Supplier`/`Veterinarian` and `Contract`/`TransportService` subtype pairs, and nested writes (`supplier.create({ data: { veterinarian: { create: … } } })`), which are atomic by construction.
- **Scalar conversions centralized** in `src/common/prisma-scalars.ts` — `Decimal` → `number`, `@db.Date`/`@db.Time` → the string or `Date` shape each Zod schema declares, and the age/day-count arithmetic that used to be `EXTRACT(YEAR FROM AGE(...))` in SQL.

### 3.5. Validation with Zod

Validation is **not defined in the API** but in the shared `@repo/schemas` package. There each domain defines its Zod schemas and turns them into NestJS DTOs with `createZodDto`:

```typescript
// packages/schemas/src/service-offered/service-offered.dto.ts
import { createZodDto } from "nestjs-zod";

export class CreateServiceOfferedDto extends createZodDto(
  createServiceOfferedSchema,
) {}
export class UpdateServiceOfferedDto extends createZodDto(
  updateServiceOfferedSchema,
) {}
```

In the controller, by typing `@Body() data: CreateServiceOfferedDto`, the global `ZodValidationPipe` validates the request body against the Zod schema **before** running the method. If it fails, NestJS automatically returns a `400 Bad Request` with the details.

### 3.6. Error handling

- The **native NestJS exception hierarchy** is used (`NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, etc.).
- The **service** layer throws `NotFoundException` when an entity does not exist; NestJS turns it into a `404`.
- **Database errors** are translated by `PrismaExceptionFilter` (`src/common/prisma-exception.filter.ts`), which maps Prisma error codes to HTTP responses: `P2025` (record not found) → `404`, `P2002` (unique violation) → `409`, `P2003` (foreign key violation) and `CHECK` constraint failures → `400`; connection/authentication failures (`P1xxx`) and any unknown code are logged and returned as a `500`.
- **Authentication and authorization** are enforced globally by `JwtAuthGuard` and `PermissionsGuard` (see §3.7); a missing or invalid token is a `401`, a missing permission is a `403`.

### 3.7. Authentication and authorization (JWT)

The API is **closed by default**. Authentication uses **Passport + JWT**, and authorization is driven by a role/permission model stored in the database.

**Credentials and token issuance:**

- `POST /auth/login` is the **only public endpoint** — it is explicitly marked with `@Public()`. It is protected by `LocalAuthGuard`, which runs the `passport-local` strategy: the `LocalStrategy` calls `AuthService.validateUser`, which looks the user up by email and compares the password with **bcrypt** (`SALT_ROUNDS = 10`). On failure it throws a `WrongUsernameOrPasswordError` (`401`).
- On success, `AuthService.login` signs a JWT with `@nestjs/jwt` whose payload is `{ sub: user.id, email, roleId }` and returns `{ id, email, token }`.
- The signing secret comes from `JWT_SECRET` (required at boot — `jwt.config.ts` throws if it is missing) and the lifetime from `JWT_EXPIRES_IN` (default `7d`).
- Every other request is authenticated by the `JwtStrategy`, which reads the `Authorization: Bearer <token>` header and attaches `{ id, email, roleId }` to `req.user`.

**Guards (registered once, module‑wide, via `APP_GUARD`):**

1. **`JwtAuthGuard`** — rejects requests without a valid token with a `401`, unless the handler/class is marked with `@Public()`.
2. **`PermissionsGuard`** — runs after authentication and checks the permission declared with `@RequirePermission('module.action')`. Routes **without** a `@RequirePermission` decorator only need a valid token.

**Permissions model:**

- The catalog of every permission code lives in `src/modules/auth/permissions.ts` and follows `<module>.<action>`, where the only actions are `create`, `read` and `edit` (DELETE endpoints require `.edit`). Codes are typed (`PermissionCode`), so a typo in a controller is a **compile error**.
- The seed writes those codes into the `permissions` table, and roles are granted permissions through the `role_permissions` join table.
- `PermissionsGuard` reads the caller's grants **from the database on every request** (rather than baking them into the token), so revoking a permission or deactivating a role takes effect immediately. It also requires the role to be `isActive` and not `isDeleted`.
- Two roles are seeded: **Admin** (all permissions) and **Worker** (every permission except the `auth` and `role` administration modules). The `Admin` role itself is protected — it cannot be renamed, deactivated or deleted, and a role that still has users assigned cannot be deleted (soft delete via `is_deleted`).

**Auth and administration endpoints:**

| Method & route                        | Permission        | Purpose                                       |
| ------------------------------------- | ----------------- | --------------------------------------------- |
| `POST /auth/login`                    | _public_          | Exchange email + password for a JWT           |
| `GET /auth/me`                        | _any authenticated_ | Current user + role name + permission codes |
| `POST /auth/register`                 | `auth.create`     | Create a user (`password` is hashed)          |
| `GET /auth/users`, `GET /auth/users/:id` | `auth.read`    | List / read users                             |
| `PUT /auth/users/:id`, `DELETE /auth/users/:id` | `auth.edit` | Update / delete a user (you cannot delete yourself) |
| `GET /roles`, `GET /roles/:id`, `GET /roles/select` | `role.read` | List / read roles (and a `{ value, label }` select view) |
| `POST /roles`                         | `role.create`     | Create a role with its permission ids         |
| `PUT /roles/:id`, `DELETE /roles/:id` | `role.edit`       | Update (replace permissions) / soft-delete a role |
| `PUT /roles/:id/users/:userId`        | `role.edit`       | Assign a role to a user                       |
| `GET /permissions`                    | `role.read`       | The permission catalog                         |

### 3.8. Module catalog

| Module                | Base route            | Description                                                                                              |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| **prisma**            | —                     | Infrastructure: the Prisma client and its connection lifecycle. Exposes no routes.                       |
| **auth**              | `/auth`               | Login, JWT issuance, the current session and **user management** (users are the API accounts).           |
| **role**              | `/roles`, `/permissions` | **Role and permission administration**: CRUD of roles, their grants, and the permission catalog.      |
| **animal**            | `/animals`            | Animal CRUD + search + statistics (`/stats`). Age is derived in the scalar mappers, not in SQL.          |
| **adoption**          | `/adoptions`          | Adoption records.                                                                                        |
| **activity**          | `/activities`         | Activities (vaccination, feeding, transport…) scheduled for an animal and its offered service.           |
| **clinic**            | `/clinics`            | Veterinary clinics.                                                                                      |
| **contract**          | `/contracts`          | Contracts with suppliers (uses `PATCH` to update; auto-expires overdue contracts).                       |
| **donation**          | `/donations`          | Donations received.                                                                                      |
| **reports**           | `/reports`            | **Analytical reports** over several tables (see below).                                                  |
| **service-offered**   | `/services-offered`   | Services offered under a contract.                                                                       |
| **supplier**          | `/suppliers`          | Suppliers (veterinarians, food and service companies).                                                   |
| **transport-service** | `/transport-services` | Transport services (extension of a contract).                                                            |
| **veterinarian**      | `/veterinarians`      | Specialized veterinarian data.                                                                           |

Each domain module exposes the usual set of REST endpoints: `GET /` (list), `GET /search` (search with filters + pagination), `GET /:id`, `POST /`, `PUT|PATCH /:id`, `DELETE /:id`. Every one of them requires a valid JWT, and each handler declares the permission it needs through `@RequirePermission`.

The **`reports`** module is special: instead of CRUD, it exposes read-only analytical queries built with Prisma across several tables:

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
      - pgdata:/var/lib/postgresql/data # persistence
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
- The container starts **empty**. The schema is applied by Prisma migrations (`pnpm --filter api run prisma:deploy`) and the data by the seed (`pnpm --filter api run db:seed`) — see §4.3.
- Data persists in the named volume `pgdata`.

### 4.2. Data model and relationships

The schema (`apps/api/prisma/schema.prisma`, applied through the migrations in `apps/api/prisma/migrations/`) defines **14 models**. All primary keys are UUIDs (`@default(uuid())`, generated by the Prisma client) except the extension tables, which reuse the UUID of their parent table. Enumerations are `SMALLINT` columns whose integer values are defined in `packages/schemas/src/enums.ts` and enforced by `CHECK` constraints; indexes speed up frequent queries. The original PascalCase table names and snake_case columns are preserved through `@@map` / `@map`; the newer auth tables map to `roles`, `permissions` and `role_permissions`.

**Domain tables:**

| Table                    | PK                          | Notable fields                                                                                                                         | Relationships                                    |
| ------------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Clinic**               | `id_clinic`                 | `name`, `province`, `address`                                                                                                          | —                                                |
| **Supplier**             | `id_supplier`               | `name`, `address`, `type` (SMALLINT CHECK: 1 Veterinarian / 2 Food Company / 3 Service Company), `phone`, `contact_email`, `contact_name`, `province` | —                                                |
| **Veterinarian**         | `id_supplier` (FK→Supplier) | `modality`, `specialty`, `fax`, `veterinarian_email`, `city_distance`                                                                  | 1:1 with Supplier, N:1 with Clinic (`id_clinic`) |
| **Contract**             | `id_contract`               | `contract_category` (SMALLINT CHECK: 1 Veterinarian / 2 Food / 3 Service), `start_date`, `end_date`, `reconciliation_date`, `description`, `status` (SMALLINT CHECK: 1 Active / 2 Inactive / 3 Expired) | N:1 with Supplier (`id_supplier`)                |
| **TransportService**     | `id_contract` (FK→Contract) | `vehicle`, `transport_modality`                                                                                                        | 1:1 with Contract                                |
| **ServiceOffered**       | `id_service`                | `name`, `food_type`, `base_price`, `surcharge`                                                                                         | N:1 with Contract (`id_contract`)                |
| **Animal**               | `id_animal`                 | `name`, `species`, `breed`, `birth_date`, `weight`, `entry_date`, `status` (SMALLINT CHECK: 1 Available / 2 Adopted / 3 Reserved / 4 Deceased) | —                                                |
| **Activity**             | `id_activity`               | `description`, `date`, `time`                                                                                                          | N:1 with Animal and with ServiceOffered          |
| **Adoption**             | `id_adoption`               | `adoption_date`, `adoption_price`                                                                                                      | N:1 with Animal                                  |
| **Donation**             | `id_donation`               | `amount`, `date`, `donor`                                                                                                              | N:1 with Animal                                  |

**Auth and administration tables:**

| Table                | PK                                    | Notable fields                                                                       | Relationships                       |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------- |
| **User**             | `id`                                  | `email` (UNIQUE), `password_hash` (bcrypt), `name`, `last_name`, `created_at`        | N:1 with Role (`role_id`, Restrict) |
| **Role**             | `id`                                  | `name` (UNIQUE), `is_active`, `is_deleted` (soft delete)                             | 1:N with User, N:M with Permission  |
| **Permission**       | `id`                                  | `name`, `code` (UNIQUE, `<module>.<action>`, e.g. `supplier.edit`)                   | N:M with Role                       |
| **RolePermission**   | `(role_id, permission_id)` composite  | —                                                                                    | Join Role ↔ Permission (CASCADE)    |

**Relationship diagram (summary):**

```
Supplier ──1:1── Veterinarian ──N:1── Clinic
   │
   └──1:N── Contract ──1:1── TransportService
                │
                └──1:N── ServiceOffered ──1:N── Activity ──N:1── Animal

Animal ──1:N── Adoption
      └──1:N── Donation

Role ──1:N── User          (a user has exactly one role)
Role ──N:M── Permission    (via role_permissions)
```

**Notable constraints and design:**

- `Contract` has a `CHECK (end_date >= start_date)`; `ServiceOffered` has `base_price >= 0` and `surcharge >= 0`.
- `Animal` has `CHECK (status IN (1,2,3,4))` and `birth_date IS NULL OR birth_date <= entry_date`.
- `Supplier.type`, `Contract.contract_category` and `Contract.status` have SMALLINT `CHECK` constraints matching the integer enums in `@repo/schemas`.
- `Veterinarian` and `TransportService` apply an **inheritance/extension by shared key** pattern: their PK _is_ the FK to the parent table (`Supplier` and `Contract` respectively), modeling a 1:1 relationship.
- `User.role_id` uses `ON DELETE RESTRICT` (a role with users cannot be dropped); `role_permissions` cascades on both sides. Deleting a role is **soft** (`is_deleted`), so users and audit history never dangle.
- Indexes on frequently filtered columns: `Supplier(province, type)`, `Contract(contract_category, start_date, end_date, status)`, `ServiceOffered(id_contract)`, `Animal(species, status, entry_date DESC)`, `Activity(date, id_service)`, `User(role_id)`, `role_permissions(permission_id)`.

### 4.3. Migrations and seed

The schema lives in `apps/api/prisma/schema.prisma` and is applied through **versioned, squashed migrations** in `apps/api/prisma/migrations/`:

| Migration                             | What it does                                                       |
| ------------------------------------- | ----------------------------------------------------------------- |
| `…_init`                              | Creates the base domain tables and appends the `CHECK` constraints by hand. |
| `…_add_user`                          | Creates the `User` table.                                          |
| `…_add_roles_and_permissions`         | Creates `roles` / `permissions` / `role_permissions`, adds `User.role_id` (nullable → backfill → `NOT NULL`). |
| `…_uuid_keys_and_int_enums`           | Replaces the integer/serial keys with UUIDs and converts the string enums to `SMALLINT`. |

Because the Prisma schema language cannot express them, the `CHECK` constraints (the value sets for `type` / `contract_category` / `status`, `base_price >= 0`, `surcharge >= 0`, `end_date >= start_date`, `birth_date <= entry_date`) are appended by hand to the migrations and never dropped by `migrate dev`.

Since Prisma 7 the CLI reads the datasource URL from **`apps/api/prisma.config.ts`** (which loads the root `.env`), not from `schema.prisma`.

Everyday commands (all run from `apps/api`, reading the root `.env` through `dotenv-cli`):

| Command                                 | What it does                                   |
| --------------------------------------- | ---------------------------------------------- |
| `pnpm --filter api run prisma:migrate`  | Creates and applies a migration in development |
| `pnpm --filter api run prisma:deploy`   | Applies pending migrations (CI / production)   |
| `pnpm --filter api run prisma:generate` | Regenerates the typed client                   |
| `pnpm --filter api run db:seed`         | Loads the development data                     |
| `pnpm --filter api run db:reset`        | Drops, re-migrates and re-seeds the database   |
| `pnpm --filter api run prisma:studio`   | Opens Prisma Studio to browse the data         |

The seed is `apps/api/prisma/seed.ts` — plain TypeScript against the typed client (with the `@prisma/adapter-pg` driver adapter). It sets **no explicit primary keys**: every insert gets a generated UUID, and related rows are linked through the ids returned by `create`. For the shelter data it clears the tables in foreign-key order first, so it is safe to re-run.

The seed also bootstraps **access control**, which it **upserts** rather than clears (re-seeding never wipes accounts):

- It writes every code from `PERMISSION_CATALOG` into `permissions`.
- It upserts the **`Admin`** role (all permissions) and the **`Worker`** role (everything except the `auth` and `role` modules), then rewrites their grants.
- It upserts an initial admin account, **`admin@shelter.local` / `Admin12345!`** by default, overridable with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` environment variables.

### 4.4. Connection from the API

The connection string is built in `apps/api/src/modules/prisma/database-url.ts`. `DATABASE_URL` wins when set — that is what the Prisma CLI reads, so the two cannot drift — and otherwise it is composed from the individual `DB_*` variables:

```typescript
export function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const user = encodeURIComponent(process.env.DB_USER ?? "postgres");
  // ... DB_PASSWORD / DB_HOST / DB_PORT / DB_NAME
  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}
```

Since **Prisma 7** the client no longer uses a built-in engine connection: it connects through a **driver adapter** (`@prisma/adapter-pg`), so the Postgres driver is supplied explicitly. `PrismaModule` is a global NestJS module providing `PrismaService`, which extends `PrismaClient`, passes the adapter in its constructor and opens/closes the connection in `onModuleInit` / `onModuleDestroy`:

```typescript
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: buildDatabaseUrl() }) });
  }
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

`main.ts` calls `app.enableShutdownHooks()` so a `SIGTERM` disconnects cleanly, and `database-url.ts` loads the root `.env` before building the URL (so the e2e suite, which imports `AppModule` directly, connects to the right database). Each service receives the client by injection:

```typescript
constructor(private readonly prisma: PrismaService) {}
```

---

## 5. The `@repo/schemas` package

`packages/schemas` is the **most strategic** package in the monorepo: it defines the **single source of truth** for validation and types, shared between API and web.

- **Name:** `@repo/schemas` (version `1.0.0`).
- **Libraries:** `zod` (schema definition) + `nestjs-zod` (`createZodDto` to generate NestJS DTOs).
- **Dual ESM/CommonJS exports** so it can be consumed by both the web (Vite/ESM) and the API (NestJS/CommonJS).

**Organization:** one folder per domain under `src/` (18 domains), each one with:

- `[domain].ts` — Zod schemas and inferred types.
- `[domain].dto.ts` — NestJS DTOs generated with `createZodDto`.
- `index.ts` — barrel export.

There is also a root `src/enums.ts` holding the **integer enumerations** shared by the database, the API and the web (`AnimalStatus`, `ContractStatus`, `ContractCategory`, `SupplierType`) together with helpers (`intEnum`, `coercedIntEnum`, `enumOptions`) and the matching display labels. Enum values are `SMALLINT`s on the wire and are mirrored by the database `CHECK` constraints.

And a root `src/index.ts` that re-exports all the domains. The domains include: `animal`, `adoption`, `activity`, `clinic`, `contract`, `donation`, `service-offered`, `supplier`, `transport-service`, `veterinarian`, plus the **auth domains** (`auth` — register/login/session/login output; `role` — roles and permissions) and the report-specific domains (`active-veterinarians`, `animal-care-schedule`, `complementary-service-contracts`, `food-supplier-contracts`, `revenue-plan`, `veterinarian-contracts`).

**Definition pattern** (`contract` example — note the UUID keys and the integer enums):

```typescript
import { z } from "zod";
import { ContractCategory, ContractStatus, coercedIntEnum, intEnum } from "../enums";

export const contractCategoryEnum = intEnum(ContractCategory); // 1 | 2 | 3
export const contractStatusEnum = intEnum(ContractStatus); // 1 | 2 | 3

const contractBaseSchema = z.object({
  id_supplier: z.uuid("A valid supplier is required"),
  contract_category: contractCategoryEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reconciliation_date: z.coerce.date().optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  status: contractStatusEnum.default(ContractStatus.Active),
});

// Variants derived from the base schema:
export const createContractSchema = contractBaseSchema.refine(
  (d) => d.end_date >= d.start_date,
  { message: "End date must be greater than or equal to start date" },
);
export const updateContractSchema = contractBaseSchema.partial(); // all optional
export const searchContractsFiltersSchema = z.object({
  id_supplier: z.uuid().optional(),
  contract_category: coercedIntEnum(ContractCategory).optional(),
  status: coercedIntEnum(ContractStatus).optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});
export const contractSchema = contractBaseSchema.extend({ id: z.uuid() });

// Automatically inferred types:
export type CreateContract = z.infer<typeof createContractSchema>;
export type Contract = z.infer<typeof contractSchema>;
```

Core idea: from **one base schema** the variants `create` (refined), `update` (`.partial()`), `search` (filters) and the full entity are derived, and from each one the **TypeScript type is inferred** with `z.infer`. This way, validation and types never get out of sync. The `auth` domain follows the same rule for the token flow — `registerInputSchema`, `loginInputSchema`, `userSchema`, `userWithRoleSchema`, `sessionUserSchema` (user + role name + permission codes) and `loginOutputSchema` — as does `role` (`createRoleSchema`, `updateRoleSchema`, `permissionSchema`, `roleSchema`).

**Dual consumption:**

- In the **API**, the `*.dto.ts` (`createZodDto`) are used in controllers → automatic validation via `ZodValidationPipe`.
- In the **web**, the schemas are used with React Hook Form's `zodResolver` to validate forms, and the inferred types type the API calls.

---

## 6. The web frontend (React + Vite)

`apps/web` is a modern SPA built with **React 19** and **Vite 5**, heavily leaning on the **TanStack** ecosystem.

**Authentication on the client:**

- The JWT is kept in a **cookie** (name configurable via `VITE_PUBLIC_TOKEN_COOKIE_NAME`, `SameSite=Strict`, `Secure` on HTTPS), read/written by `lib/api/token.ts` (`getToken` / `setToken` / `clearToken`).
- Every authenticated request goes through **`fetchWithAuth`** (`lib/api/fetch-with-auth.ts`), which attaches the `Authorization: Bearer <token>` header and centralises the `401` handling — clearing the token, redirecting to `/login` and throwing an `ApiError`.
- The root route (`routes/__root.tsx`) runs a `beforeLoad` **presence check** (a redirect to `/login` with a `redirect` search param when there is no token), while `lib/utils/safe-redirect.ts` guards against open-redirects when returning after login.
- `useSession()` (`modules/auth/use-session.ts`) fetches `GET /auth/me` (cached with `staleTime: Infinity`) and exposes the user plus its permission codes; `useCanAccessAdministration()` uses those codes to decide whether the **Administration** section renders, and `useLogout()` clears the token and the query cache.

**Main libraries (with their role):**

| Library                       | Version | Role                                                  |
| ----------------------------- | ------- | ----------------------------------------------------- |
| **React / React DOM**         | 19.2    | UI library                                            |
| **Vite**                      | 5.1     | Bundler / dev server                                  |
| **TanStack Router**           | 1.170   | **File-based** routing (generates `routeTree.gen.ts`) |
| **TanStack Query**            | 5.100   | Server state: fetching, caching, mutations            |
| **TanStack Table**            | —       | Data tables (lists)                                   |
| **React Hook Form**           | 7.76    | Form state and validation                             |
| **@hookform/resolvers**       | 5.4     | Bridge between RHF and Zod (`zodResolver`)            |
| **Zod**                       | 4.4    | Client-side validation (reusing `@repo/schemas`; monorepo `overrides` pins a single Zod 4, overriding the web's declared `^3.25`) |
| **Tailwind CSS**              | 4.3     | Utility styling (+ `@tailwindcss/vite`)               |
| **Radix UI** (via `@repo/ui`) | —       | Accessible UI primitives                              |
| **nuqs**                      | 2.8     | Filter/pagination state synced with the URL           |
| **Recharts**                  | 2.10    | Charts (dashboard / reports)                          |
| **Sonner**                    | 2.0     | _Toast_ notifications                                 |
| **Lucide React**              | 0.331   | SVG icons                                             |
| **Zustand**                   | 5.0     | Global client state (minimal use)                     |

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
│   │   ├── rhf-fk-select.tsx      # Foreign-key select (loads options with Query)
│   │   └── rhf-checkbox-group.tsx # Permission checkboxes for role forms
│   └── custom-table.tsx           # TanStack Table wrapper
├── lib/
│   ├── api/             # fetchWithAuth, token cookie, ApiError
│   └── utils/           # safe-redirect, read-error-message, cn, …
├── modules/             # One module per entity (mirrors the backend)
│   ├── auth/            # login, useSession, user card
│   ├── role/            # roles list + forms (permissions included)
│   └── contract/        # e.g. forms/ (create/edit), list/, services.ts
├── routes/              # File-based routes (TanStack Router)
│   ├── login.tsx                        → /login
│   ├── administration/
│   │   ├── users/                       → /administration/users (+/new, /:id/edit)
│   │   └── roles/                       → /administration/roles (+/new, /:id/edit)
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

- **`services.ts`** — HTTP client built on **`fetchWithAuth`** (which adds the `Authorization: Bearer <token>` header and centralises the `401` handling). The base URL comes from `import.meta.env.VITE_PUBLIC_API_URL` (`http://localhost:3002`). There is no axios or dedicated client; TanStack Query manages caching and mutations:

  ```typescript
  export const fetchContracts = async (filters = {}) => {
    const params = new URLSearchParams(/* ...filters... */);
    return fetchWithAuth<ContractListItem[]>(
      `/contracts/search?${params}`,
    );
  };
  ```

- **Lists (`list/contracts-list.tsx`)** — use `useQuery` to fetch data, `nuqs` (`useQueryStates`) to keep filters and pagination in the URL, and `TanStack Table` (via `CustomTable`) to render the columns. Deletions use `useMutation` + `invalidateQueries`.

- **Forms (`forms/edit-contract.tsx`)** — use `useForm` with `zodResolver(createContractSchema)` (the same schema as the backend!), `useMutation` for `POST`/`PATCH`, invalidate the cache in `onSuccess` and show a _toast_ with Sonner.

- **Reusable fields (`components/fields/`)** — generic RHF wrappers (`<Controller>`) that standardize inputs, selects, dates and foreign-key selects. `RHFFkSelect` even uses `useQuery` internally to dynamically load the options (e.g. the supplier list).

The result is a very **consistent and declarative** pattern: for each entity there is a `services.ts` (data), a `list/` folder (table with URL filters) and a `forms/` folder (create/edit with shared Zod validation).

---

## 7. Auxiliary shared packages

| Package                       | Content                                                                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@repo/ui`**                | UI component library based on **Radix UI + Tailwind + CVA**: `Button`, `Card`, `Select`, `Input`, `Label`, `Tabs`, `DatePicker`, etc. Consumed by the web. |
| **`@repo/eslint-config`**     | Shared ESLint configuration (TypeScript + Prettier) for the whole monorepo.                                                                                |
| **`@repo/typescript-config`** | Base `tsconfig` extended by all packages/apps.                                                                                                             |

At the root level, **Husky + lint-staged + commitlint** guarantee quality: automatic formatting and commit message validation (Conventional Commits) on every _commit_.

---

## 8. Getting started

```bash
# 1. Install dependencies (from the root)
pnpm install

# 2. Bring up the PostgreSQL database (Docker)
docker compose up -d
#    → creates the 'animal-shelter-db' container, exposes port 5434

# 3. Apply the schema and load the development data
pnpm --filter api run prisma:deploy
pnpm --filter api run db:seed
#    → the seed also creates the Admin role and the admin@… account (see below)

# 4. Start API + Web in development mode (Turborepo)
pnpm dev
#    → API:  http://localhost:3002
#    → Web:  http://localhost:5173

# 5. Sign in (default seeded admin account, overridable via SEED_ADMIN_*)
#    email:    admin@shelter.local
#    password: Admin12345!
```

**Relevant environment variables:**

| Variable                            | Where       | Default                                 |
| ----------------------------------- | ----------- | --------------------------------------- |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | root `.env` | postgres / postgres / animal_shelter_db |
| `DB_PORT`                           | root `.env` | 5434                                    |
| `DB_HOST`                           | API         | localhost                               |
| `DATABASE_URL`                      | root `.env` | `postgresql://…:5434/animal_shelter_db` (read by the Prisma CLI) |
| `JWT_SECRET`                        | root `.env` | **required** — the API refuses to boot without it |
| `JWT_EXPIRES_IN`                    | root `.env` | `7d`                                    |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | root `.env` | `admin@shelter.local` / `Admin12345!` |
| `WEB_URL`                           | API (CORS)  | http://localhost:5173                   |
| `VITE_PUBLIC_API_URL`               | Web         | http://localhost:3002                   |
| `VITE_PUBLIC_TOKEN_COOKIE_NAME`, `VITE_PUBLIC_TOKEN_MAX_AGE` | Web | `animal_shelter_token` / `86400` |

---

### Final summary

This project is a **modern full-stack monorepo** that stands out for:

- **End-to-end type safety** thanks to shared Zod via `@repo/schemas`.
- A **clean, layered NestJS API** (Controller → Service → **Prisma ORM**) where the typed Prisma client replaced the former Repository pattern and hand-written SQL — no raw queries, versioned migrations, and an exception filter that maps Prisma error codes to proper HTTP statuses.
- **Closed-by-default JWT authentication** with **roles, permissions and user management**, enforced by global guards and a permission catalog shared between the API, the seed and the clients.
- A **declarative frontend** built on the TanStack ecosystem (Router/Query/Table) with a uniform module pattern and a permission-aware UI.
- Well-integrated monorepo tooling (pnpm + Turborepo) and quality tooling (ESLint/Prettier/Husky).

---
