import { z } from "zod";

export const supplierTypeEnum = z.enum([
  "Veterinarian",
  "Food Company",
  "Service Company",
]);

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
  type: supplierTypeEnum.optional(),
  province: z.string().optional(),
  phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_name: z.string().optional(),
  limit: z.number().int().min(1).default(10),
  offset: z.number().int().min(0).default(0),
});

export const supplierSchema = createSupplierSchema.extend({
  id: z.number().int(),
});

export type CreateSupplier = z.infer<typeof createSupplierSchema>;
export type UpdateSupplier = z.infer<typeof updateSupplierSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type SupplierType = z.infer<typeof supplierTypeEnum>;
export type SearchSuppliersFilters = z.infer<
  typeof searchSuppliersFiltersSchema
>;
