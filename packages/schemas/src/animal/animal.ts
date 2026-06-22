import { z } from "zod";

const animalStatusEnum = z.enum(["available", "adopted", "reserved"]);

const animalBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  birth_date: z.coerce.date({ error: "Birth date is required" }),
  weight: z.number({ error: "Weight is required" }).min(0),
  status: animalStatusEnum.default("available"),
});

const birthDateNotInFuture = (data: { birth_date?: Date }) =>
  !data.birth_date || data.birth_date <= new Date();

const birthDateRefineOptions = {
  message: "Birth date cannot be after entry date",
  path: ["birth_date"],
};

export const createAnimalSchema = animalBaseSchema.refine(
  birthDateNotInFuture,
  birthDateRefineOptions,
);

export const updateAnimalSchema = animalBaseSchema
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided",
    path: ["name"],
  })
  .refine(birthDateNotInFuture, birthDateRefineOptions);

export const searchAnimalsFiltersSchema = z.object({
  species: z.string().optional(),
  breed: z.string().optional(),
  status: z.array(z.string()).optional(),
  minAge: z.coerce.number().int().min(0).optional(),
  maxAge: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const animalSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  species: z.string(),
  breed: z.string().optional(),
  age: z.number().int().min(0).optional(),
  birth_date: z.coerce.date().optional(),
  weight: z.number().min(0).optional(),
  status: animalStatusEnum,
  entry_date: z.date(),
});

export type CreateAnimal = z.infer<typeof createAnimalSchema>;
export type UpdateAnimal = z.infer<typeof updateAnimalSchema>;
export type Animal = z.infer<typeof animalSchema>;
export type SearchAnimalsFilters = z.infer<typeof searchAnimalsFiltersSchema>;
export type AnimalStatus = z.infer<typeof animalStatusEnum>;
