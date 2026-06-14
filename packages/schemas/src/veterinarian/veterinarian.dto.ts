import { createZodDto } from "nestjs-zod";
import {
  createVeterinarianSchema,
  updateVeterinarianSchema,
  veterinarianSchema,
  searchVeterinariansFiltersSchema,
} from "./veterinarian";

export class CreateVeterinarianDto extends createZodDto(
  createVeterinarianSchema,
) {}

export class UpdateVeterinarianDto extends createZodDto(
  updateVeterinarianSchema,
) {}

export class VeterinarianDto extends createZodDto(veterinarianSchema) {}

export class SearchVeterinariansFiltersDto extends createZodDto(
  searchVeterinariansFiltersSchema,
) {}

export type {
  CreateVeterinarian,
  UpdateVeterinarian,
  Veterinarian,
  SearchVeterinariansFilters,
} from "./veterinarian";
