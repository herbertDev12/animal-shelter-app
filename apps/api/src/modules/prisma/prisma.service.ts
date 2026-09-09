import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { buildDatabaseUrl } from './database-url';

/**
 * The application's single Prisma client.
 *
 * Since Prisma 7 the client connects through a driver adapter rather than a
 * built-in engine connection, so the Postgres driver is supplied explicitly.
 *
 * Implementing `OnModuleDestroy` is what lets `app.close()` release the
 * connection on its own — the previous `pg.Pool` was a bare factory provider
 * with no lifecycle hook, which is why the e2e helper had to end the pool by
 * hand to stop Jest hanging.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: buildDatabaseUrl() }),
      log: [
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('✓ Database connected successfully');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
