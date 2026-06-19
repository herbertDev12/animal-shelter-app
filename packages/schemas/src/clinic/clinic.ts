import { z } from "zod";

export const createClinicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  province: z.string().optional(),
  address: z.string().optional(),
});

export const updateClinicSchema = createClinicSchema.partial();

export const searchClinicsFiltersSchema = z.object({
  name: z.string().optional(),
  province: z.string().optional(),
  address: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const clinicSchema = createClinicSchema.extend({
  id: z.number().int(),
});

export type CreateClinic = z.infer<typeof createClinicSchema>;
export type UpdateClinic = z.infer<typeof updateClinicSchema>;
export type Clinic = z.infer<typeof clinicSchema>;
export type SearchClinicsFilters = z.infer<typeof searchClinicsFiltersSchema>;
