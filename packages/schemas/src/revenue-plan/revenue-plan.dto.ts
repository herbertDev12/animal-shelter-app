import { createZodDto } from "nestjs-zod";
import {
  revenuePlanSchema,
  revenuePlanFiltersSchema,
  revenuePlanResponseSchema,
} from "./revenue-plan";

export class RevenuePlanDto extends createZodDto(revenuePlanSchema) {}

export class RevenuePlanFiltersDto extends createZodDto(
  revenuePlanFiltersSchema,
) {}

export class RevenuePlanResponseDto extends createZodDto(
  revenuePlanResponseSchema,
) {}
