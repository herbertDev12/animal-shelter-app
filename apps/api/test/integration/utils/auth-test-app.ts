import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import { App } from 'supertest/types';
import { AuthModule } from '../../../src/modules/auth/auth.module';
import { PrismaModule } from '../../../src/modules/prisma/prisma.module';
import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { PrismaExceptionFilter } from '../../../src/common/prisma-exception.filter';

export const TEST_EMAIL_PREFIX = 'auth-it-';

export interface AuthTestContext {
  app: INestApplication<App>;
  server: App;
  prisma: PrismaService;
}

export async function createAuthTestApp(): Promise<AuthTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [PrismaModule, AuthModule],
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
