import { z } from "zod";

export const createAdoptionSchema = z.object({
  id_animal: z.number().int().min(1, "Animal ID is required"),
  adoption_date: z.coerce.date(),
  adoption_price: z.number().min(0).optional(),
});

export const updateAdoptionSchema = createAdoptionSchema.partial();

export const searchAdoptionsFiltersSchema = z.object({
  id_animal: z.coerce.number().int().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adoptionSchema = createAdoptionSchema.extend({
  id: z.number().int(),
});

export type CreateAdoption = z.infer<typeof createAdoptionSchema>;
export type UpdateAdoption = z.infer<typeof updateAdoptionSchema>;
export type Adoption = z.infer<typeof adoptionSchema>;
export type SearchAdoptionsFilters = z.infer<
  typeof searchAdoptionsFiltersSchema
>;
