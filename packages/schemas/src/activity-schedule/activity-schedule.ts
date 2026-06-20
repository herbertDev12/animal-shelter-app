import { z } from "zod";

export const createActivityScheduleSchema = z.object({
  id_animal: z.number().int().positive("Animal ID is required"),
  id_contract: z.number().int().positive("Contract ID is required"),
  activity_type: z.string().max(50).optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional().nullable(),
  duration_days: z.number().int().min(1).default(1),
});

export const updateActivityScheduleSchema = z.object({
  id_animal: z.number().int().positive().optional(),
  id_contract: z.number().int().positive().optional(),
  activity_type: z.string().max(50).optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  date: z.string().optional(),
  time: z.string().optional().nullable(),
  duration_days: z.number().int().min(1).optional(),
});

export const searchActivityScheduleFiltersSchema = z.object({
  id_animal: z.coerce.number().int().optional(),
  id_contract: z.coerce.number().int().optional(),
  activity_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const activityScheduleSchema = z.object({
  id_schedule: z.number().int(),
  id_animal: z.number().int(),
  animal_name: z.string().nullable().optional(),
  id_contract: z.number().int(),
  activity_type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  date: z.string(),
  time: z.string().nullable().optional(),
  duration_days: z.number().int(),
});

export type CreateActivitySchedule = z.infer<
  typeof createActivityScheduleSchema
>;
export type UpdateActivitySchedule = z.infer<
  typeof updateActivityScheduleSchema
>;
export type ActivitySchedule = z.infer<typeof activityScheduleSchema>;
export type SearchActivityScheduleFilters = z.infer<
  typeof searchActivityScheduleFiltersSchema
>;
