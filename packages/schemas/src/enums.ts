import { z } from "zod";

// Enumerations shared by the database, the API and the web app. Every value is
// stored as a SMALLINT and sent over the wire as a number; the labels are only
// for display. Values start at 1 so that 0 / a missing value is never mistaken
// for a real member. Mirrors the CHECK constraints in the init migration.

export const AnimalStatus = {
  Available: 1,
  Adopted: 2,
  Reserved: 3,
  Deceased: 4,
} as const;
export type AnimalStatus = (typeof AnimalStatus)[keyof typeof AnimalStatus];

export const ContractStatus = {
  Active: 1,
  Inactive: 2,
  Expired: 3,
} as const;
export type ContractStatus =
  (typeof ContractStatus)[keyof typeof ContractStatus];

export const ContractCategory = {
  Veterinarian: 1,
  Food: 2,
  Service: 3,
} as const;
export type ContractCategory =
  (typeof ContractCategory)[keyof typeof ContractCategory];

export const SupplierType = {
  Veterinarian: 1,
  FoodCompany: 2,
  ServiceCompany: 3,
} as const;
export type SupplierType = (typeof SupplierType)[keyof typeof SupplierType];

export const AnimalStatusLabel: Record<AnimalStatus, string> = {
  [AnimalStatus.Available]: "Available",
  [AnimalStatus.Adopted]: "Adopted",
  [AnimalStatus.Reserved]: "Reserved",
  [AnimalStatus.Deceased]: "Deceased",
};

export const ContractStatusLabel: Record<ContractStatus, string> = {
  [ContractStatus.Active]: "Active",
  [ContractStatus.Inactive]: "Inactive",
  [ContractStatus.Expired]: "Expired",
};

export const ContractCategoryLabel: Record<ContractCategory, string> = {
  [ContractCategory.Veterinarian]: "Veterinarian",
  [ContractCategory.Food]: "Food",
  [ContractCategory.Service]: "Service",
};

export const SupplierTypeLabel: Record<SupplierType, string> = {
  [SupplierType.Veterinarian]: "Veterinarian",
  [SupplierType.FoodCompany]: "Food Company",
  [SupplierType.ServiceCompany]: "Service Company",
};

type IntEnum = Record<string, number>;

function enumValues<T extends IntEnum>(values: T) {
  return Object.values(values) as [T[keyof T], ...T[keyof T][]];
}

/** Accepts exactly one of the enum's integer values. */
export function intEnum<T extends IntEnum>(values: T) {
  return z.literal(enumValues(values));
}

/** Same as `intEnum`, but coerces first — for query-string filters. */
export function coercedIntEnum<T extends IntEnum>(values: T) {
  return z.coerce.number().pipe(intEnum(values));
}

/** `[{ value, label }]` for a select, in declaration order. */
export function enumOptions<T extends IntEnum>(
  labels: Record<T[keyof T], string>,
  values: T,
) {
  return enumValues(values).map((value) => ({
    value,
    label: labels[value],
  }));
}
