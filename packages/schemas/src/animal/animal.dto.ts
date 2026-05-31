import { createZodDto } from "nestjs-zod";
import {
  createAnimalSchema,
  updateAnimalSchema,
  animalSchema,
  searchAnimalsFiltersSchema,
} from "./animal";

export class CreateAnimalDto extends createZodDto(createAnimalSchema) {}

export class UpdateAnimalDto extends createZodDto(updateAnimalSchema) {}

export class AnimalDto extends createZodDto(animalSchema) {}

export class SearchAnimalsFiltersDto extends createZodDto(
  searchAnimalsFiltersSchema,
) {}

export type {
  CreateAnimal,
  UpdateAnimal,
  Animal,
  SearchAnimalsFilters,
  AnimalStatus,
} from "./animal";
