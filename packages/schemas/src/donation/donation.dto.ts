import { createZodDto } from "nestjs-zod";
import {
  createDonationSchema,
  updateDonationSchema,
  donationSchema,
  donationListItemSchema,
  searchDonationsFiltersSchema,
} from "./donation";

export class CreateDonationDto extends createZodDto(createDonationSchema) {}
export class UpdateDonationDto extends createZodDto(updateDonationSchema) {}
export class DonationDto extends createZodDto(donationSchema) {}
export class DonationListItemDto extends createZodDto(donationListItemSchema) {}
export class SearchDonationsFiltersDto extends createZodDto(
  searchDonationsFiltersSchema,
) {}

export type {
  CreateDonation,
  UpdateDonation,
  Donation,
  DonationListItem,
  SearchDonationsFilters,
} from "./donation";
