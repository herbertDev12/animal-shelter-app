import { createZodDto } from "nestjs-zod";
import {
  activeVeterinarianSchema,
  activeVeterinarianFiltersSchema,
  activeVeterinariansResponseSchema,
} from "./active-veterinarians";

export class ActiveVeterinarianDto extends createZodDto(
  activeVeterinarianSchema,
) {}

export class ActiveVeterinarianFiltersDto extends createZodDto(
  activeVeterinarianFiltersSchema,
) {}

export class ActiveVeterinariansResponseDto extends createZodDto(
  activeVeterinariansResponseSchema,
) {}
