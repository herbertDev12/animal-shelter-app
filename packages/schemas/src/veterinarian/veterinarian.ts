import { z } from "zod";

export const createVeterinarianSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  address: z.string().max(200).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  contact_email: z.string().max(100).optional().nullable(),
  contact_name: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  id_clinic: z.number().int().positive("Clinic ID must be positive"),
  modality: z.string().max(50).optional().nullable(),
  specialty: z.string().max(100).optional().nullable(),
  fax: z.string().max(20).optional().nullable(),
  veterinarian_email: z.string().max(100).optional().nullable(),
  city_distance: z.number().positive().optional().nullable(),
});

export const updateVeterinarianSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().max(200).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  contact_email: z.string().max(100).optional().nullable(),
  contact_name: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  id_clinic: z.number().int().positive().optional(),
  modality: z.string().max(50).optional().nullable(),
  specialty: z.string().max(100).optional().nullable(),
  fax: z.string().max(20).optional().nullable(),
  veterinarian_email: z.string().max(100).optional().nullable(),
  city_distance: z.number().positive().optional().nullable(),
});

export const searchVeterinariansFiltersSchema = z.object({
  id_clinic: z.coerce.number().int().optional(),
  modality: z.string().optional(),
  specialty: z.string().optional(),
  province: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const veterinarianSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  address: z.string().nullable().optional(),
  type: z.literal("Veterinarian"),
  phone: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  id_clinic: z.number().int(),
  clinic_name: z.string().nullable().optional(),
  clinic_province: z.string().nullable().optional(),
  modality: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
  veterinarian_email: z.string().nullable().optional(),
  city_distance: z.number().nullable().optional(),
});

export type CreateVeterinarian = z.infer<typeof createVeterinarianSchema>;
export type UpdateVeterinarian = z.infer<typeof updateVeterinarianSchema>;
export type Veterinarian = z.infer<typeof veterinarianSchema>;
export type SearchVeterinariansFilters = z.infer<
  typeof searchVeterinariansFiltersSchema
>;
