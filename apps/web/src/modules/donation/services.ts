import type {
  Donation,
  CreateDonation,
  SearchDonationsFilters,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchDonations = (
  filters: Partial<SearchDonationsFilters> = {},
): Promise<Donation[]> => {
  const params = new URLSearchParams();

  if (filters.id_animal != null)
    params.append("id_animal", String(filters.id_animal));
  if (filters.minAmount != null)
    params.append("minAmount", String(filters.minAmount));
  if (filters.maxAmount != null)
    params.append("maxAmount", String(filters.maxAmount));
  if (filters.donor) params.append("donor", filters.donor);
  if (filters.startDate)
    params.append("startDate", new Date(filters.startDate).toISOString());
  if (filters.endDate)
    params.append("endDate", new Date(filters.endDate).toISOString());
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<Donation[]>(`/donations/search?${params.toString()}`);
};

export const fetchDonation = (id: string): Promise<Donation> => {
  return fetchWithAuth<Donation>(`/donations/${id}`);
};

export const createDonation = (data: CreateDonation): Promise<Donation> => {
  return fetchWithAuth<Donation>(`/donations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateDonation = (
  id: string,
  data: Partial<CreateDonation>,
): Promise<Donation> => {
  return fetchWithAuth<Donation>(`/donations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteDonation = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/donations/${id}`, {
    method: "DELETE",
  });
};
