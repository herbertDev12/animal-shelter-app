import { z } from "zod";

export const activeVeterinarianSchema = z.object({
  date: z.date(),
  veterinarian_name: z.string().min(1),
  clinic_name: z.string().min(1),
  province: z.string().min(1),
  specialty: z.string().min(1),
  phone: z.string().min(1),
  fax: z.string().nullable().optional(),
  email: z.string().min(1),
  distance_to_nearest_city: z.number().nullable().optional(),
  modalities: z.string().nullable().optional(),
});

export const activeVeterinarianFiltersSchema = z.object({
  clinic_id: z.coerce.number().int().optional(),
  province: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const activeVeterinariansResponseSchema = z.object({
  data: z.array(activeVeterinarianSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export type ActiveVeterinarian = z.infer<typeof activeVeterinarianSchema>;
export type ActiveVeterinarianFilters = z.infer<
  typeof activeVeterinarianFiltersSchema
>;
export type ActiveVeterinariansResponse = z.infer<
  typeof activeVeterinariansResponseSchema
>;
