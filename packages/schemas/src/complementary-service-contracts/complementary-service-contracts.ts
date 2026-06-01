import { z } from "zod";

export const complementaryServiceContractSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
  reconciliation_date: z.date(),
  description: z.string().min(1),
  service_type: z.string().min(1),
  cost_per_service: z.number(),
  province: z.string().min(1),
});

export const complementaryServiceContractFiltersSchema = z.object({
  limit: z.number().int().min(1).default(10),
  offset: z.number().int().min(0).default(0),
});

export const complementaryServiceContractsResponseSchema = z.object({
  data: z.array(complementaryServiceContractSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export type ComplementaryServiceContract = z.infer<
  typeof complementaryServiceContractSchema
>;
export type ComplementaryServiceContractFilters = z.infer<
  typeof complementaryServiceContractFiltersSchema
>;
export type ComplementaryServiceContractsResponse = z.infer<
  typeof complementaryServiceContractsResponseSchema
>;
