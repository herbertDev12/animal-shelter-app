import { z } from "zod";
import { contractStatusEnum } from "../contract/contract";

const transportServiceBaseSchema = z.object({
  id_supplier: z.number().int().positive("Supplier ID must be positive"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reconciliation_date: z.coerce.date().optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  status: contractStatusEnum.default("Active"),
  vehicle: z.string().min(1, "Vehicle is required").max(100),
  transport_modality: z
    .string()
    .min(1, "Transport modality is required")
    .max(100),
});

export const createTransportServiceSchema = transportServiceBaseSchema.refine(
  (data) => data.end_date >= data.start_date,
  {
    message: "End date must be greater than or equal to start date",
    path: ["end_date"],
  },
);

export const updateTransportServiceSchema = transportServiceBaseSchema
  .partial()
  .refine(
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

export const searchTransportServicesFiltersSchema = z.object({
  id_supplier: z.number().int().optional(),
  status: contractStatusEnum.optional(),
  vehicle: z.string().optional(),
  transport_modality: z.string().optional(),
  limit: z.number().int().min(1).default(10),
  offset: z.number().int().min(0).default(0),
});

export const transportServiceSchema = z.object({
  id: z.number().int(),
  id_supplier: z.number().int(),
  contract_category: z.literal("Service"),
  start_date: z.date(),
  end_date: z.date(),
  reconciliation_date: z.date().optional().nullable(),
  description: z.string().optional().nullable(),
  status: contractStatusEnum,
  vehicle: z.string(),
  transport_modality: z.string(),
});

export type CreateTransportService = z.infer<
  typeof createTransportServiceSchema
>;
export type UpdateTransportService = z.infer<
  typeof updateTransportServiceSchema
>;
export type TransportService = z.infer<typeof transportServiceSchema>;
export type SearchTransportServicesFilters = z.infer<
  typeof searchTransportServicesFiltersSchema
>;
