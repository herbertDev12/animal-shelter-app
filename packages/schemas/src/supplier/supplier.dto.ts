import { createZodDto } from "nestjs-zod";
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierSchema,
  searchSuppliersFiltersSchema,
} from "./supplier";

export class CreateSupplierDto extends createZodDto(createSupplierSchema) {}

export class UpdateSupplierDto extends createZodDto(updateSupplierSchema) {}

export class SupplierDto extends createZodDto(supplierSchema) {}

export class SearchSuppliersFiltersDto extends createZodDto(
  searchSuppliersFiltersSchema,
) {}

export type {
  CreateSupplier,
  UpdateSupplier,
  Supplier,
  SupplierType,
  SearchSuppliersFilters,
} from "./supplier";
