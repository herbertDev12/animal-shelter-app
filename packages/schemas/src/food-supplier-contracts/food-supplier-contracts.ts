import { z } from "zod";

export const foodSupplierContractSchema = z.object({
  supplier_name: z.string().min(1),
  food_type: z.string().min(1),
  province: z.string().min(1),
  address: z.string().min(1),
  start_date: z.date(),
  end_date: z.date(),
  reconciliation_date: z.date(),
  description: z.string().min(1),
});

export const foodSupplierContractFiltersSchema = z.object({
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const foodSupplierContractsResponseSchema = z.object({
  data: z.array(foodSupplierContractSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
});

export type FoodSupplierContract = z.infer<typeof foodSupplierContractSchema>;
export type FoodSupplierContractFilters = z.infer<
  typeof foodSupplierContractFiltersSchema
>;
export type FoodSupplierContractsResponse = z.infer<
  typeof foodSupplierContractsResponseSchema
>;
