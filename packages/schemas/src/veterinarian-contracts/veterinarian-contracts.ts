import { z } from "zod";

export const reconciledVeterinarianContractSchema = z.object({
  veterinarian_name: z.string().min(1),
  clinic_name: z.string().min(1),
  province: z.string().min(1),
  address: z.string().min(1),
  specialty: z.string().min(1),
  start_date: z.date(),
  end_date: z.date(),
  reconciliation_date: z.date(),
  description: z.string().min(1),
});

export const reconciledVeterinarianContractFiltersSchema = z.object({
  limit: z.number().int().min(1).default(10),
  offset: z.number().int().min(0).default(0),
});

export const reconciledVeterinarianContractsResponseSchema = z.object({
  data: z.array(reconciledVeterinarianContractSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export type ReconciledVeterinarianContract = z.infer<
  typeof reconciledVeterinarianContractSchema
>;
export type ReconciledVeterinarianContractFilters = z.infer<
  typeof reconciledVeterinarianContractFiltersSchema
>;
export type ReconciledVeterinarianContractsResponse = z.infer<
  typeof reconciledVeterinarianContractsResponseSchema
>;
