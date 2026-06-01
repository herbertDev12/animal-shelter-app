import { createZodDto } from "nestjs-zod";
import {
  foodSupplierContractSchema,
  foodSupplierContractFiltersSchema,
  foodSupplierContractsResponseSchema,
} from "./food-supplier-contracts";

export class FoodSupplierContractDto extends createZodDto(
  foodSupplierContractSchema,
) {}

export class FoodSupplierContractFiltersDto extends createZodDto(
  foodSupplierContractFiltersSchema,
) {}

export class FoodSupplierContractsResponseDto extends createZodDto(
  foodSupplierContractsResponseSchema,
) {}
