import {
  AnimalStatus,
  AnimalStatusLabel,
  ContractCategory,
  ContractCategoryLabel,
  ContractStatus,
  ContractStatusLabel,
  SupplierType,
  SupplierTypeLabel,
  enumOptions,
} from "@repo/schemas";

// Select options and badge styles for the shared enumerations, defined once so
// forms, filters and tables stay in sync when a value is added.

export const CONTRACT_STATUS_OPTIONS = enumOptions(
  ContractStatusLabel,
  ContractStatus,
);

export const CONTRACT_CATEGORY_OPTIONS = enumOptions(
  ContractCategoryLabel,
  ContractCategory,
);

export const SUPPLIER_TYPE_OPTIONS = enumOptions(
  SupplierTypeLabel,
  SupplierType,
);

/** Deceased is a valid status, but it is not something the form sets. */
export const ANIMAL_STATUS_FORM_OPTIONS = enumOptions(
  AnimalStatusLabel,
  AnimalStatus,
).filter((option) => option.value !== AnimalStatus.Deceased);

export const CONTRACT_STATUS_BADGE_CLASS: Record<ContractStatus, string> = {
  [ContractStatus.Active]: "bg-green-500/15 text-green-400",
  [ContractStatus.Inactive]: "bg-gray-500/15 text-gray-400",
  [ContractStatus.Expired]: "bg-red-500/15 text-red-400",
};

export const ANIMAL_STATUS_BADGE_CLASS: Partial<Record<AnimalStatus, string>> =
  {
    [AnimalStatus.Available]: "bg-green-500/15 text-green-400",
    [AnimalStatus.Adopted]: "bg-purple-500/15 text-purple-400",
    [AnimalStatus.Reserved]: "bg-yellow-500/15 text-yellow-400",
  };
