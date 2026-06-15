import { z } from "zod";

export const createDonationSchema = z.object({
  id_animal: z.number().int().min(1, "Animal ID is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.coerce.date(),
  donor: z.string().max(100).optional(),
});

export const updateDonationSchema = createDonationSchema.partial();

export const searchDonationsFiltersSchema = z.object({
  id_animal: z.coerce.number().int().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  donor: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const donationSchema = createDonationSchema.extend({
  id: z.number().int(),
});

export type CreateDonation = z.infer<typeof createDonationSchema>;
export type UpdateDonation = z.infer<typeof updateDonationSchema>;
export type Donation = z.infer<typeof donationSchema>;
export type SearchDonationsFilters = z.infer<
  typeof searchDonationsFiltersSchema
>;
