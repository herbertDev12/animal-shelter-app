import { createZodDto } from "nestjs-zod";
import {
  createAdoptionSchema,
  updateAdoptionSchema,
  adoptionSchema,
  searchAdoptionsFiltersSchema,
} from "./adoption";

export class CreateAdoptionDto extends createZodDto(createAdoptionSchema) {}
export class UpdateAdoptionDto extends createZodDto(updateAdoptionSchema) {}
export class AdoptionDto extends createZodDto(adoptionSchema) {}
export class SearchAdoptionsFiltersDto extends createZodDto(
  searchAdoptionsFiltersSchema,
) {}

export type {
  CreateAdoption,
  UpdateAdoption,
  Adoption,
  SearchAdoptionsFilters,
} from "./adoption";
