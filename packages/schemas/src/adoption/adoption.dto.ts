import { createZodDto } from "nestjs-zod";
import {
  createAdoptionSchema,
  updateAdoptionSchema,
  adoptionSchema,
  adoptionListItemSchema,
  searchAdoptionsFiltersSchema,
} from "./adoption";

export class CreateAdoptionDto extends createZodDto(createAdoptionSchema) {}
export class UpdateAdoptionDto extends createZodDto(updateAdoptionSchema) {}
export class AdoptionDto extends createZodDto(adoptionSchema) {}
export class AdoptionListItemDto extends createZodDto(adoptionListItemSchema) {}
export class SearchAdoptionsFiltersDto extends createZodDto(
  searchAdoptionsFiltersSchema,
) {}

export type {
  CreateAdoption,
  UpdateAdoption,
  Adoption,
  AdoptionListItem,
  SearchAdoptionsFilters,
} from "./adoption";
