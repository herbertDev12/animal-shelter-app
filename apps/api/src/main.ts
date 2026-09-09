import * as dotenv from 'dotenv';
import * as path from 'path';
import { ZodValidationPipe } from 'nestjs-zod';

// Load environment variables before other modules are imported
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());
  // Lets PrismaService.onModuleDestroy run on SIGTERM so the connection closes.
  app.enableShutdownHooks();
  app.enableCors({
    origin: process.env.WEB_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3002);
}
bootstrap();
