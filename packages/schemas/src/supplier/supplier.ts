import { z } from "zod";
import { SupplierType, coercedIntEnum, intEnum } from "../enums";

export const supplierTypeEnum = intEnum(SupplierType);

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  type: supplierTypeEnum,
  phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_name: z.string().optional(),
  province: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const searchSuppliersFiltersSchema = z.object({
  name: z.string().optional(),
  type: coercedIntEnum(SupplierType).optional(),
  province: z.string().optional(),
  phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_name: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const supplierSchema = createSupplierSchema.extend({
  id: z.uuid(),
  // Nullable columns come back as null, not absent.
  address: z.string().nullish(),
  phone: z.string().nullish(),
  contact_email: z.string().nullish(),
  contact_name: z.string().nullish(),
  province: z.string().nullish(),
});

export type CreateSupplier = z.infer<typeof createSupplierSchema>;
export type UpdateSupplier = z.infer<typeof updateSupplierSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type SearchSuppliersFilters = z.infer<
  typeof searchSuppliersFiltersSchema
>;
