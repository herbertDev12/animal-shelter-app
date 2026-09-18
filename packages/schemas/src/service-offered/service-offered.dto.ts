import { createZodDto } from "nestjs-zod";
import {
  createServiceOfferedSchema,
  updateServiceOfferedSchema,
  serviceOfferedSchema,
  serviceOfferedListItemSchema,
  searchServiceOfferedFiltersSchema,
} from "./service-offered";

export class CreateServiceOfferedDto extends createZodDto(
  createServiceOfferedSchema,
) {}
export class UpdateServiceOfferedDto extends createZodDto(
  updateServiceOfferedSchema,
) {}
export class ServiceOfferedDto extends createZodDto(serviceOfferedSchema) {}
export class ServiceOfferedListItemDto extends createZodDto(
  serviceOfferedListItemSchema,
) {}
export class SearchServiceOfferedFiltersDto extends createZodDto(
  searchServiceOfferedFiltersSchema,
) {}

export type {
  CreateServiceOffered,
  UpdateServiceOffered,
  ServiceOffered,
  ServiceOfferedListItem,
  SearchServiceOfferedFilters,
} from "./service-offered";
