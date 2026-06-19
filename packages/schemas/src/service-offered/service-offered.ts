import { z } from "zod";

const serviceOfferedBaseSchema = z.object({
  id_contract: z.number().int().positive("Contract ID must be positive"),
  name: z.string().min(1, "Name is required").max(100),
  service_type: z.string().max(100).optional().nullable(),
  food_type: z.string().max(100).optional().nullable(),
  base_price: z.number().nonnegative("Base price must be >= 0"),
});

export const createServiceOfferedSchema = serviceOfferedBaseSchema;

export const updateServiceOfferedSchema = serviceOfferedBaseSchema.partial();

export const searchServiceOfferedFiltersSchema = z.object({
  id_contract: z.coerce.number().int().optional(),
  service_type: z.string().optional(),
  food_type: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const serviceOfferedSchema = serviceOfferedBaseSchema.extend({
  id: z.number().int(),
});

export type CreateServiceOffered = z.infer<typeof createServiceOfferedSchema>;
export type UpdateServiceOffered = z.infer<typeof updateServiceOfferedSchema>;
export type ServiceOffered = z.infer<typeof serviceOfferedSchema>;
export type SearchServiceOfferedFilters = z.infer<
  typeof searchServiceOfferedFiltersSchema
>;
