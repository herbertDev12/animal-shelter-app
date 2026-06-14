import { createZodDto } from "nestjs-zod";
import {
  createClinicSchema,
  updateClinicSchema,
  clinicSchema,
  searchClinicsFiltersSchema,
} from "./clinic";

export class CreateClinicDto extends createZodDto(createClinicSchema) {}

export class UpdateClinicDto extends createZodDto(updateClinicSchema) {}

export class ClinicDto extends createZodDto(clinicSchema) {}

export class SearchClinicsFiltersDto extends createZodDto(
  searchClinicsFiltersSchema,
) {}

export type {
  CreateClinic,
  UpdateClinic,
  Clinic,
  SearchClinicsFilters,
} from "./clinic";
