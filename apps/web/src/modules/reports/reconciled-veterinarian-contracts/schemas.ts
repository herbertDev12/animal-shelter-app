import { z } from "zod";

export const reconciledVeterinarianContractSchema = z.object({
  veterinarian_name: z.string().min(1),
  clinic_name: z.string().min(1),
  specialty: z.string().min(1),
  province: z.string().min(1),
  address: z.string().min(1),
  start_date: z.date(),
  end_date: z.date(),
  reconciliation_date: z.date(),
  description: z.string().min(1),
});

export type Contract = z.infer<typeof reconciledVeterinarianContractSchema>;
