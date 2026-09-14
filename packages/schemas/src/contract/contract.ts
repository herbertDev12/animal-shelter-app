import { z } from "zod";
import {
  ContractCategory,
  ContractStatus,
  coercedIntEnum,
  intEnum,
} from "../enums";

export const contractCategoryEnum = intEnum(ContractCategory);
export const contractStatusEnum = intEnum(ContractStatus);

const contractBaseSchema = z.object({
  id_supplier: z.uuid("A valid supplier is required"),
  contract_category: contractCategoryEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reconciliation_date: z.coerce.date().optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  status: contractStatusEnum.default(ContractStatus.Active),
});

export const createContractSchema = contractBaseSchema.refine(
  (data) => data.end_date >= data.start_date,
  {
    message: "End date must be greater than or equal to start date",
    path: ["end_date"],
  },
);

export const updateContractSchema = contractBaseSchema.partial().refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return data.end_date >= data.start_date;
    }
    return true;
  },
  {
    message: "End date must be greater than or equal to start date",
    path: ["end_date"],
  },
);

export const searchContractsFiltersSchema = z.object({
  id_supplier: z.uuid("A valid supplier is required").optional(),
  contract_category: coercedIntEnum(ContractCategory).optional(),
  status: coercedIntEnum(ContractStatus).optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const contractSchema = contractBaseSchema.extend({
  id: z.uuid(),
});

export type CreateContract = z.infer<typeof createContractSchema>;
export type UpdateContract = z.infer<typeof updateContractSchema>;
export type Contract = z.infer<typeof contractSchema>;
export type SearchContractsFilters = z.infer<
  typeof searchContractsFiltersSchema
>;
