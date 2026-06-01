import { z } from "zod";

export const animalCareScheduleSchema = z.object({
  animal_name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().nullable().optional(),
  age: z.number().int().nullable().optional(),
  weight: z.number().nullable().optional(),
  days_in_shelter: z.number().int(),
  day: z.date(),
  hour: z.string().nullable().optional(),
  activity_description: z.string().nullable().optional(),
  price: z.number(),
  assigned_veterinarian_name: z.string().nullable().optional(),
  assigned_food_type: z.string().nullable().optional(),
  total_veterinary_care_price: z.number(),
  transport_price: z.number(),
  total_food_price: z.number(),
  maintenance_percentage: z.number().nullable().optional(),
  total_maintenance_cost: z.number(),
});

export const animalCareScheduleFiltersSchema = z.object({
  id_animal: z.coerce.number().int().min(1),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const animalCareScheduleResponseSchema = z.object({
  data: z.array(animalCareScheduleSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export type AnimalCareSchedule = z.infer<typeof animalCareScheduleSchema>;
export type AnimalCareScheduleFilters = z.infer<
  typeof animalCareScheduleFiltersSchema
>;
export type AnimalCareScheduleResponse = z.infer<
  typeof animalCareScheduleResponseSchema
>;
