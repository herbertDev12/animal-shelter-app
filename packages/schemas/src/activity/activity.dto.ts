import { createZodDto } from "nestjs-zod";
import {
  createActivitySchema,
  updateActivitySchema,
  activitySchema,
  searchActivityFiltersSchema,
} from "./activity";

export class CreateActivityDto extends createZodDto(createActivitySchema) {}

export class UpdateActivityDto extends createZodDto(updateActivitySchema) {}

export class ActivityDto extends createZodDto(activitySchema) {}

export class SearchActivityFiltersDto extends createZodDto(
  searchActivityFiltersSchema,
) {}

export type {
  CreateActivity,
  UpdateActivity,
  Activity,
  SearchActivityFilters,
} from "./activity";
