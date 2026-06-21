import { z } from "zod";

export const createActivitySchema = z.object({
  id_animal: z.number().int().positive("Animal ID is required"),
  id_service: z.number().int().positive("Service ID is required"),
  description: z.string().max(300).optional().nullable(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional().nullable(),
});

export const updateActivitySchema = z.object({
  id_animal: z.number().int().positive().optional(),
  id_service: z.number().int().positive().optional(),
  description: z.string().max(300).optional().nullable(),
  date: z.string().optional(),
  time: z.string().optional().nullable(),
});

export const searchActivityFiltersSchema = z.object({
  id_animal: z.coerce.number().int().optional(),
  id_service: z.coerce.number().int().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const activitySchema = z.object({
  id_activity: z.number().int(),
  id_animal: z.number().int(),
  animal_name: z.string().nullable().optional(),
  id_service: z.number().int(),
  service_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  date: z.string(),
  time: z.string().nullable().optional(),
});

export type CreateActivity = z.infer<typeof createActivitySchema>;
export type UpdateActivity = z.infer<typeof updateActivitySchema>;
export type Activity = z.infer<typeof activitySchema>;
export type SearchActivityFilters = z.infer<typeof searchActivityFiltersSchema>;
