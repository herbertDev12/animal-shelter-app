import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaExceptionFilter } from '../../src/common/prisma-exception.filter';

/**
 * Builds the full Nest application exactly as `main.ts` does (global
 * ZodValidationPipe and Prisma exception filter) but without calling `listen()`.
 * The real PrismaModule is used, so these e2e tests hit the live development
 * database.
 *
 * NOTE: these tests create / update / delete real rows. Isolation is not
 * attempted on purpose — restore known data afterward with:
 *   pnpm --filter api run db:reset && pnpm --filter api run db:seed
 */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  // main.ts wires these at bootstrap, NOT in AppModule, so they must be
  // applied here or no Zod validation and no Prisma error mapping would run.
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();
  return app;
}

/**
 * Closes the Nest app. `PrismaService` implements `OnModuleDestroy`, so
 * `app.close()` disconnects on its own — no manual connection teardown needed.
 */
export async function closeTestApp(app: INestApplication<App>): Promise<void> {
  await app.close();
}

/** Id used for "not found" assertions — assumed to never exist. */
export const MISSING_ID = 999999999;

/**
 * Fetches the first id from a list endpoint so create tests can reference real
 * foreign keys (id_animal, id_supplier, id_clinic, id_contract, ...) coming from
 * the seed data instead of hardcoding ids.
 */
export async function getExistingId(
  app: INestApplication<App>,
  listPath: string,
  idField = 'id',
): Promise<number> {
  const res = await request(app.getHttpServer()).get(listPath).expect(200);
  const rows = res.body as Array<Record<string, number>>;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(
      `No rows returned from ${listPath} to derive a foreign key`,
    );
  }
  return rows[0][idField];
}
