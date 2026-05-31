import { z } from "zod";

const animalStatusEnum = z.enum(["available", "adopted", "reserved"]);

export const createAnimalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  age: z.number().int().min(0).optional(),
  status: animalStatusEnum.default("available"),
});

export const updateAnimalSchema = createAnimalSchema.partial();

export const searchAnimalsFiltersSchema = z.object({
  species: z.string().optional(),
  breed: z.string().optional(),
  status: z.array(z.string()).optional(),
  minAge: z.number().int().min(0).optional(),
  maxAge: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).default(10),
  offset: z.number().int().min(0).default(0),
});

export const animalSchema = createAnimalSchema.extend({
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type CreateAnimal = z.infer<typeof createAnimalSchema>;
export type UpdateAnimal = z.infer<typeof updateAnimalSchema>;
export type Animal = z.infer<typeof animalSchema>;
export type SearchAnimalsFilters = z.infer<typeof searchAnimalsFiltersSchema>;
export type AnimalStatus = z.infer<typeof animalStatusEnum>;
