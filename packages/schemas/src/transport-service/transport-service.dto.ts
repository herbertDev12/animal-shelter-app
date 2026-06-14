import { createZodDto } from "nestjs-zod";
import {
  createTransportServiceSchema,
  updateTransportServiceSchema,
  transportServiceSchema,
  searchTransportServicesFiltersSchema,
} from "./transport-service";

export class CreateTransportServiceDto extends createZodDto(
  createTransportServiceSchema,
) {}

export class UpdateTransportServiceDto extends createZodDto(
  updateTransportServiceSchema,
) {}

export class TransportServiceDto extends createZodDto(transportServiceSchema) {}

export class SearchTransportServicesFiltersDto extends createZodDto(
  searchTransportServicesFiltersSchema,
) {}

export type {
  CreateTransportService,
  UpdateTransportService,
  TransportService,
  SearchTransportServicesFilters,
} from "./transport-service";
