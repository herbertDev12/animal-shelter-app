import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import { Pool } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { DATABASE_CONNECTION } from '../../src/modules/database/config/database.config';

/**
 * Builds the full Nest application exactly as `main.ts` does (global
 * ZodValidationPipe) but without calling `listen()`. The real DatabaseModule and
 * repositories are used, so these e2e tests hit the live development database.
 *
 * NOTE: these tests create / update / delete real rows. Isolation is not
 * attempted on purpose — re-run the seed file (`apps/api/db-init/02-seed.sql`)
 * afterward to restore known data.
 */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  // main.ts wires this pipe at bootstrap, NOT in AppModule, so it must be
  // applied here or no Zod validation would run during tests.
  app.useGlobalPipes(new ZodValidationPipe());
  await app.init();
  return app;
}

/**
 * Closes the Nest app and the underlying pg pool. `app.close()` alone does not
 * end the pool (it is a plain useFactory provider with no shutdown hook), which
 * leaves an open handle and makes Jest hang.
 */
export async function closeTestApp(app: INestApplication<App>): Promise<void> {
  const pool = app.get<Pool>(DATABASE_CONNECTION, { strict: false });
  await app.close();
  if (pool && typeof pool.end === 'function') {
    await pool.end();
  }
}

/** Id used for "not found" assertions — assumed to never exist. */
export const MISSING_ID = 999999999;

/**
 * Asserts a GET-by-id response holds no entity. Modules without a
 * NotFoundException return 200 with an empty body, which supertest exposes as an
 * empty object `{}` (truthy), so check for the absence of an id instead.
 */
export function expectNoEntity(body: unknown): void {
  expect(
    body === null ||
      body === undefined ||
      (typeof body === 'object' && !('id' in (body as object))),
  ).toBe(true);
}

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
