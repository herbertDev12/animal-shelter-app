import { createZodDto } from "nestjs-zod";
import {
  createTransportServiceSchema,
  updateTransportServiceSchema,
  transportServiceSchema,
  transportServiceListItemSchema,
  searchTransportServicesFiltersSchema,
} from "./transport-service";

export class CreateTransportServiceDto extends createZodDto(
  createTransportServiceSchema,
) {}

export class UpdateTransportServiceDto extends createZodDto(
  updateTransportServiceSchema,
) {}

export class TransportServiceDto extends createZodDto(transportServiceSchema) {}

export class TransportServiceListItemDto extends createZodDto(
  transportServiceListItemSchema,
) {}

export class SearchTransportServicesFiltersDto extends createZodDto(
  searchTransportServicesFiltersSchema,
) {}

export type {
  CreateTransportService,
  UpdateTransportService,
  TransportService,
  TransportServiceListItem,
  SearchTransportServicesFilters,
} from "./transport-service";
