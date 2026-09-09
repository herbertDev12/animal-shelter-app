import { Prisma } from '@prisma/client';

/**
 * Conversions between Prisma's runtime scalars and the shapes the Zod schemas in
 * `@repo/schemas` declare. This is the single place the driver-level differences
 * live, so the services stay free of ad-hoc casting.
 *
 * Notably: Prisma returns `Decimal` objects for numeric columns (node-postgres
 * returned strings), `Date` at UTC midnight for `@db.Date` (node-postgres
 * returned local midnight) and `Date` for `@db.Time` (node-postgres returned an
 * "HH:MM:SS" string).
 */

type DecimalLike = Prisma.Decimal | number | string | null | undefined;

/** Decimal | number | string -> number, preserving null. */
export function num(value: DecimalLike): number | null {
  return value === null || value === undefined ? null : Number(value);
}

/** Decimal | number | string -> number, with 0 for null. */
export function numOr0(value: DecimalLike): number {
  return value === null || value === undefined ? 0 : Number(value);
}

/**
 * `COALESCE(base_price, 0) + COALESCE(surcharge, 0)`.
 *
 * Summed as `Decimal` and converted to `number` only at the end — adding money
 * as JS floats accumulates drift across a report's worth of rows.
 */
export function sumPrice(base: DecimalLike, surcharge: DecimalLike): number {
  return decimalOf(base).plus(decimalOf(surcharge)).toNumber();
}

/** Decimal for arithmetic, treating null as 0. */
export function decimalOf(value: DecimalLike): Prisma.Decimal {
  return new Prisma.Decimal(value ?? 0);
}

/** Today at UTC midnight — the instant Prisma returns for a `@db.Date` column. */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * Normalizes an inbound date to UTC midnight before writing a `@db.Date`
 * column. Without this a `"2024-03-01"` string parsed in a negative-offset
 * timezone can land on the previous day.
 */
export function toDateOnly(value: string | Date): Date {
  if (typeof value === 'string') {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

/** "YYYY-MM-DD" for the schemas that declare a date as a string. */
export function dateToString(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

/**
 * "HH:MM:SS" for a `@db.Time` column. Prisma hands back a `Date` on the epoch
 * day; the Zod schemas declare `time` / `hour` as a string.
 */
export function timeToString(value: Date | null | undefined): string | null {
  return value ? value.toISOString().slice(11, 19) : null;
}

/**
 * Parses "HH:MM" or "HH:MM:SS" into the epoch-day `Date` a `@db.Time` column
 * expects.
 */
export function toTimeOnly(value: string | Date | null): Date | null {
  if (value === null) return null;
  if (value instanceof Date) return value;
  const [hours = 0, minutes = 0, seconds = 0] = value.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
}

/**
 * `EXTRACT(YEAR FROM AGE(birth_date))` — completed years, so an animal one day
 * short of its first birthday is 0, not 1.
 */
export function completedYears(birth: Date | null | undefined): number | null {
  if (!birth) return null;
  const today = todayUtc();
  const years = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() &&
      today.getUTCDate() < birth.getUTCDate());
  return beforeBirthday ? years - 1 : years;
}

/** The UTC-midnight date `years` before today — the inverse of `completedYears`. */
export function subYears(years: number): Date {
  const today = todayUtc();
  return new Date(
    Date.UTC(
      today.getUTCFullYear() - years,
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  );
}

/** `(to - from)::int` in whole days, as Postgres computes it for two dates. */
export function daysBetween(from: Date, to: Date = todayUtc()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}
