import { createZodDto } from "nestjs-zod";
import {
  createContractSchema,
  updateContractSchema,
  contractSchema,
  contractListItemSchema,
  searchContractsFiltersSchema,
} from "./contract";

export class CreateContractDto extends createZodDto(createContractSchema) {}

export class UpdateContractDto extends createZodDto(updateContractSchema) {}

export class ContractDto extends createZodDto(contractSchema) {}
export class ContractListItemDto extends createZodDto(contractListItemSchema) {}

export class SearchContractsFiltersDto extends createZodDto(
  searchContractsFiltersSchema,
) {}

export type {
  CreateContract,
  UpdateContract,
  Contract,
  ContractListItem,
  SearchContractsFilters,
} from "./contract";
