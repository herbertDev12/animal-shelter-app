import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Load the environment before any URL is built.
 *
 * `main.ts` does this too, but it is not the only entry point: the e2e suite
 * imports `AppModule` directly, so without this the tests would silently fall
 * back to the defaults below and connect to the wrong database.
 *
 * The root `.env` is located by walking up from this file rather than by a
 * fixed number of `..` segments, so it resolves the same whether the code is
 * running from `src/` or from a compiled `dist/`.
 */
function loadEnvFiles(): void {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });

  let dir = __dirname;
  for (let depth = 0; depth < 10; depth++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) dotenv.config({ path: candidate });

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

loadEnvFiles();

/**
 * Builds the Prisma connection string.
 *
 * `DATABASE_URL` wins when set (that is what the Prisma CLI reads too, so the
 * two cannot drift). Otherwise the URL is composed from the individual `DB_*`
 * variables the project already used, with the same defaults the previous
 * `pg.Pool` config had, so an existing `.env` keeps working untouched.
 */
export function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const user = encodeURIComponent(process.env.DB_USER ?? 'postgres');
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? 'postgres');
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = process.env.DB_NAME;

  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}
