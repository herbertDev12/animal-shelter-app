import { createZodDto } from "nestjs-zod";
import {
  createServiceOfferedSchema,
  updateServiceOfferedSchema,
  serviceOfferedSchema,
  searchServiceOfferedFiltersSchema,
} from "./service-offered";

export class CreateServiceOfferedDto extends createZodDto(
  createServiceOfferedSchema,
) {}
export class UpdateServiceOfferedDto extends createZodDto(
  updateServiceOfferedSchema,
) {}
export class ServiceOfferedDto extends createZodDto(serviceOfferedSchema) {}
export class SearchServiceOfferedFiltersDto extends createZodDto(
  searchServiceOfferedFiltersSchema,
) {}

export type {
  CreateServiceOffered,
  UpdateServiceOffered,
  ServiceOffered,
  SearchServiceOfferedFilters,
} from "./service-offered";
