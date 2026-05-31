import { createZodDto } from "nestjs-zod";
import {
  reconciledVeterinarianContractSchema,
  reconciledVeterinarianContractFiltersSchema,
  reconciledVeterinarianContractsResponseSchema,
} from "./veterinarian-contracts";

export class ReconciledVeterinarianContractDto extends createZodDto(
  reconciledVeterinarianContractSchema,
) {}

export class ReconciledVeterinarianContractFiltersDto extends createZodDto(
  reconciledVeterinarianContractFiltersSchema,
) {}

export class ReconciledVeterinarianContractsResponseDto extends createZodDto(
  reconciledVeterinarianContractsResponseSchema,
) {}
