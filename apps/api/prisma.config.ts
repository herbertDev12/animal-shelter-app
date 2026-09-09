import * as path from 'path';
import * as dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// The Prisma CLI does not boot the Nest application, so the root .env has to be
// loaded here for DATABASE_URL to be available to migrate / seed / studio.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Prisma CLI configuration.
 *
 * Since Prisma 7 the connection URL no longer lives in `schema.prisma` — the CLI
 * reads it from here, and the application passes it to the client through a
 * driver adapter (see `src/modules/prisma/prisma.service.ts`).
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});
