import { z } from "zod";

export const revenuePlanSchema = z.object({
  animal_name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().nullable().optional(),
  age: z.number().int().nullable().optional(),
  total_maintenance_cost: z.number(),
  total_adoption_fee: z.number(),
  total_donations: z.number(),
  total_revenue: z.number(),
});

export const revenuePlanFiltersSchema = z.object({
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const revenuePlanResponseSchema = z.object({
  data: z.array(revenuePlanSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export type RevenuePlan = z.infer<typeof revenuePlanSchema>;
export type RevenuePlanFilters = z.infer<typeof revenuePlanFiltersSchema>;
export type RevenuePlanResponse = z.infer<typeof revenuePlanResponseSchema>;
