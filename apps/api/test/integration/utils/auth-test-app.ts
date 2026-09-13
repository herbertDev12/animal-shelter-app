import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

import { INestApplication, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../../../src/modules/auth/auth.module';
import { PrismaModule } from '../../../src/modules/prisma/prisma.module';
import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { PrismaExceptionFilter } from '../../../src/common/prisma-exception.filter';

export const TEST_EMAIL_PREFIX = 'auth-it-';
export const TEST_PASSWORD = 'correct-horse-battery';

export interface AuthTestContext {
  app: INestApplication<App>;
  server: App;
  prisma: PrismaService;
}

/**
 * Relies on the seeded Admin and Worker roles (`pnpm --filter api run db:seed`).
 * Pass extra modules to exercise their endpoints behind the global guards.
 */
export async function createAuthTestApp(
  extraImports: NonNullable<ModuleMetadata['imports']> = [],
): Promise<AuthTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [PrismaModule, AuthModule, ...extraImports],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();

  return {
    app,
    server: app.getHttpServer(),
    prisma: app.get(PrismaService),
  };
}

export async function closeAuthTestApp(ctx: AuthTestContext): Promise<void> {
  await ctx.app.close();
}

export function uniqueEmail(): string {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${TEST_EMAIL_PREFIX}${suffix}@test.local`;
}

export async function deleteTestUsers(prisma: PrismaService): Promise<void> {
  await prisma.user.deleteMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
  });
}

export async function roleIdByName(
  prisma: PrismaService,
  name: string,
): Promise<string> {
  const role = await prisma.role.findUniqueOrThrow({ where: { name } });
  return role.id;
}

/** Inserts a user directly, bypassing /auth/register (which needs an admin). */
export async function createUserWithRole(
  prisma: PrismaService,
  roleName: string,
): Promise<{ id: string; email: string }> {
  return prisma.user.create({
    data: {
      email: uniqueEmail(),
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 4),
      name: 'Test',
      roleId: await roleIdByName(prisma, roleName),
    },
    select: { id: true, email: true },
  });
}

export async function tokenFor(server: App, email: string): Promise<string> {
  const res = await request(server)
    .post('/auth/login')
    .send({ email, password: TEST_PASSWORD })
    .expect(200);
  return res.body.token;
}

/** Creates a user with the given role and returns a bearer token for it. */
export async function tokenForRole(
  ctx: AuthTestContext,
  roleName: string,
): Promise<string> {
  const user = await createUserWithRole(ctx.prisma, roleName);
  return tokenFor(ctx.server, user.email);
}
