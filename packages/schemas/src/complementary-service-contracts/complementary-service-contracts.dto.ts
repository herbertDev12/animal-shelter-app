import { createZodDto } from "nestjs-zod";
import {
  complementaryServiceContractSchema,
  complementaryServiceContractFiltersSchema,
  complementaryServiceContractsResponseSchema,
} from "./complementary-service-contracts";

export class ComplementaryServiceContractDto extends createZodDto(
  complementaryServiceContractSchema,
) {}

export class ComplementaryServiceContractFiltersDto extends createZodDto(
  complementaryServiceContractFiltersSchema,
) {}

export class ComplementaryServiceContractsResponseDto extends createZodDto(
  complementaryServiceContractsResponseSchema,
) {}
