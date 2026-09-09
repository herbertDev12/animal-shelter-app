import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/**
 * Translates Prisma's error codes into HTTP responses.
 *
 * This is what makes the "missing row is a 404" rule cheap: `delete` and
 * `update` raise P2025 when the row is gone, so the services do not need a
 * check-then-act round trip just to produce the right status.
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();
    const translated = this.translate(exception);

    if (translated instanceof InternalServerErrorException) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(translated.getStatus()).json(translated.getResponse());
  }

  private translate(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
  ): HttpException {
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return new BadRequestException('Invalid query parameters');
    }

    // P1xxx are connection / authentication / timeout failures — infrastructure
    // problems, never the caller's fault.
    if (exception.code?.startsWith('P1')) {
      return new InternalServerErrorException('Database unavailable');
    }

    switch (exception.code) {
      // "An operation failed because it depends on one or more records that
      // were required but not found."
      case 'P2025':
        return new NotFoundException(
          this.metaMessage(exception) ?? 'Record not found',
        );

      // Unique constraint violation.
      case 'P2002': {
        // `meta.target` is the offending column list, but its shape is not
        // guaranteed — only name the fields when it is actually nameable.
        const target = exception.meta?.target;
        const fields = Array.isArray(target)
          ? target.filter((t): t is string => typeof t === 'string').join(', ')
          : typeof target === 'string'
            ? target
            : '';
        return new ConflictException(
          fields
            ? `A record with this ${fields} already exists`
            : 'Record already exists',
        );
      }

      // Foreign key constraint violation — the client referenced a row that
      // does not exist, or tried to delete one that is still referenced.
      case 'P2003':
        return new BadRequestException(
          this.metaMessage(exception) ??
            'Referenced record does not exist, or is still in use',
        );

      // Raw database error surfaced through Prisma. CHECK constraints (23514)
      // and not-null violations (23502) arrive here.
      case 'P2010':
      case 'P2011':
        return new BadRequestException(
          this.metaMessage(exception) ?? 'Database constraint violated',
        );

      default:
        return new InternalServerErrorException('Database error');
    }
  }

  private metaMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string | null {
    const cause = exception.meta?.cause;
    const message = exception.meta?.message;
    if (typeof cause === 'string') return cause;
    if (typeof message === 'string') return message;

    // Postgres CHECK constraint violations arrive as a raw 23514 with the
    // constraint name attached; surfacing it makes the 400 actionable.
    const constraint = exception.meta?.constraint;
    if (typeof constraint === 'string') {
      return `Constraint "${constraint}" violated`;
    }
    return null;
  }
}
