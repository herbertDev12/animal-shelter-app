import { createZodDto } from "nestjs-zod";
import {
  createActivityScheduleSchema,
  updateActivityScheduleSchema,
  activityScheduleSchema,
  searchActivityScheduleFiltersSchema,
} from "./activity-schedule";

export class CreateActivityScheduleDto extends createZodDto(
  createActivityScheduleSchema,
) {}

export class UpdateActivityScheduleDto extends createZodDto(
  updateActivityScheduleSchema,
) {}

export class ActivityScheduleDto extends createZodDto(activityScheduleSchema) {}

export class SearchActivityScheduleFiltersDto extends createZodDto(
  searchActivityScheduleFiltersSchema,
) {}

export type {
  CreateActivitySchedule,
  UpdateActivitySchedule,
  ActivitySchedule,
  SearchActivityScheduleFilters,
} from "./activity-schedule";
