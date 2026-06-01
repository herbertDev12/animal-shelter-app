import { createZodDto } from "nestjs-zod";
import {
  animalCareScheduleSchema,
  animalCareScheduleFiltersSchema,
  animalCareScheduleResponseSchema,
} from "./animal-care-schedule";

export class AnimalCareScheduleDto extends createZodDto(
  animalCareScheduleSchema,
) {}

export class AnimalCareScheduleFiltersDto extends createZodDto(
  animalCareScheduleFiltersSchema,
) {}

export class AnimalCareScheduleResponseDto extends createZodDto(
  animalCareScheduleResponseSchema,
) {}
